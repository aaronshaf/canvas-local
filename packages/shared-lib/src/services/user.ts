import { Context, Effect, Layer } from 'effect';
import { UnifiedApiClientLive, UnifiedApiClientService } from '../api/client/unified-client';
import { NotFoundError } from '../core/errors';
import type { User } from '../schemas/user';
import { DatabaseServiceTag, DatabaseServiceLive } from './database';
import { LoggerServiceTag, LoggerServiceLive } from './logger';

export interface UserService {
  readonly getCurrentUser: () => Effect.Effect<User, NotFoundError, never>;
  readonly getUserById: (userId: string) => Effect.Effect<User, NotFoundError, never>;
  readonly updateLocalUser: (user: User) => Effect.Effect<void, never, never>;
  readonly getCachedUser: (userId: string) => Effect.Effect<User | null, never, never>;
}

export class UserServiceTag extends Context.Tag('UserService')<UserServiceTag, UserService>() {}

const makeUserService = Effect.gen(function* () {
  const apiClient = yield* UnifiedApiClientService;
  const database = yield* DatabaseServiceTag;
  const logger = yield* LoggerServiceTag;

  const getCurrentUser = (): Effect.Effect<User, NotFoundError, never> =>
    Effect.gen(function* () {
      yield* logger.info('Fetching current user');

      // Try GraphQL first
      if (apiClient.preferGraphQL) {
        try {
          interface GetCurrentUserQuery {
            legacyNode: {
              __typename: 'User';
              id: string;
              _id: string;
              name: string;
              email: string | null;
              avatarUrl: string | null;
              pronouns: string | null;
              loginId: string | null;
              sisId: string | null;
            } | null;
          }

          const GetCurrentUserDocument = `
            query GetCurrentUser {
              legacyNode(_id: "1", type: User) {
                ... on User {
                  id
                  _id
                  name
                  email
                  avatarUrl
                  pronouns
                  loginId
                  sisId
                }
              }
            }
          `;

          const result = yield* apiClient.query<GetCurrentUserQuery>(GetCurrentUserDocument, {});

          if (result.legacyNode?.__typename === 'User') {
            const userData = result.legacyNode;
            const user: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email || '',
              avatar_url: userData.avatarUrl || undefined,
              pronouns: userData.pronouns || undefined,
              login_id: userData.loginId || undefined,
              sis_user_id: userData.sisId || undefined,
            };

            yield* updateLocalUser(user);
            return user;
          }
          // If GraphQL didn't return a user, fall through to REST
        } catch (error) {
          yield* logger.warn('GraphQL query failed, falling back to REST', { error });
        }
      }

      // Fall back to REST API
      interface CanvasUserResponse {
        id: number;
        name: string;
        primary_email?: string;
        email?: string;
        avatar_url?: string;
        pronouns?: string;
        login_id?: string;
        sis_user_id?: string;
      }
      const userData = yield* apiClient.get<CanvasUserResponse>('/users/self').pipe(
        Effect.catchAll(() =>
          Effect.fail(
            new NotFoundError({
              message: 'Current user not found',
              resource: 'user',
            }),
          ),
        ),
      );
      const user: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.primary_email || userData.email || '',
        avatar_url: userData.avatar_url,
        pronouns: userData.pronouns,
        login_id: userData.login_id,
        sis_user_id: userData.sis_user_id,
      };

      yield* updateLocalUser(user);
      return user;
    }).pipe(
      Effect.catchAll((error) => {
        if (error._tag === 'NotFoundError') {
          return Effect.fail(error);
        }
        return Effect.fail(
          new NotFoundError({
            message: 'Current user not found',
            resource: 'user',
          }),
        );
      }),
    );

  const getUserById = (userId: string): Effect.Effect<User, NotFoundError, never> =>
    Effect.gen(function* () {
      yield* logger.info('Fetching user by ID', { userId });

      // Check cache first
      const cached = yield* getCachedUser(userId);
      if (cached) {
        yield* logger.debug('User found in cache', { userId });
        return cached;
      }

      // Try GraphQL first
      if (apiClient.preferGraphQL) {
        try {
          interface GetUserProfileQuery {
            legacyNode: {
              __typename: 'User';
              id: string;
              _id: string;
              name: string;
              email: string | null;
              avatarUrl: string | null;
              pronouns: string | null;
              loginId: string | null;
              sisId: string | null;
            } | null;
          }

          const GetUserProfileDocument = `
            query GetUserProfile($userId: ID!) {
              legacyNode(_id: $userId, type: User) {
                ... on User {
                  id
                  _id
                  name
                  email
                  avatarUrl
                  pronouns
                  loginId
                  sisId
                }
              }
            }
          `;

          const result = yield* apiClient.query<GetUserProfileQuery>(GetUserProfileDocument, {
            userId,
          });

          if (result.legacyNode?.__typename === 'User') {
            const userData = result.legacyNode;
            const user: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email || '',
              avatar_url: userData.avatarUrl || undefined,
              pronouns: userData.pronouns || undefined,
              login_id: userData.loginId || undefined,
              sis_user_id: userData.sisId || undefined,
            };

            yield* updateLocalUser(user);
            return user;
          }
          // If GraphQL didn't return a user, fall through to REST
        } catch (error) {
          yield* logger.warn('GraphQL query failed, falling back to REST', { error });
        }
      }

      // Fall back to REST API
      interface CanvasUserResponse {
        id: number;
        name: string;
        primary_email?: string;
        email?: string;
        avatar_url?: string;
        pronouns?: string;
        login_id?: string;
        sis_user_id?: string;
      }
      const userData = yield* apiClient.get<CanvasUserResponse>(`/users/${userId}`).pipe(
        Effect.catchAll(() =>
          Effect.fail(
            new NotFoundError({
              message: `User not found: ${userId}`,
              resource: 'user',
              id: userId,
            }),
          ),
        ),
      );
      const user: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.primary_email || userData.email || '',
        avatar_url: userData.avatar_url,
        pronouns: userData.pronouns,
        login_id: userData.login_id,
        sis_user_id: userData.sis_user_id,
      };

      yield* updateLocalUser(user);
      return user;
    }).pipe(
      Effect.catchAll((error) => {
        if (error._tag === 'NotFoundError') {
          return Effect.fail(error);
        }
        return Effect.fail(
          new NotFoundError({
            message: `User not found: ${userId}`,
            resource: 'user',
            id: userId,
          }),
        );
      }),
    );

  const updateLocalUser = (user: User) =>
    Effect.gen(function* () {
      yield* logger.debug('Updating local user', { userId: user.id });

      yield* database
        .execute(
          `INSERT OR REPLACE INTO users (
            id, name, email, avatar_url, pronouns, login_id, sis_id, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          [
            user.id,
            user.name,
            user.email,
            user.avatar_url || null,
            user.pronouns || null,
            user.login_id || null,
            user.sis_user_id || null,
          ],
        )
        .pipe(
          Effect.catchAll((error) => {
            logger.error('Failed to update local user', { error });
            return Effect.succeed(undefined);
          }),
        );
    });

  const getCachedUser = (userId: string) =>
    Effect.gen(function* () {
      const result = yield* database
        .execute('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])
        .pipe(Effect.catchAll(() => Effect.succeed({ rows: [] })));

      if (result.rows.length === 0) {
        return null;
      }

      interface UserRow {
        id: string;
        name: string;
        email: string;
        avatar_url?: string | null;
        pronouns?: string | null;
        login_id?: string | null;
        sis_id?: string | null;
      }
      const row = result.rows[0] as UserRow;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        avatar_url: row.avatar_url || undefined,
        pronouns: row.pronouns || undefined,
        login_id: row.login_id || undefined,
        sis_user_id: row.sis_id || undefined,
      };
    });

  return {
    getCurrentUser,
    getUserById,
    updateLocalUser,
    getCachedUser,
  };
});

export const UserServiceLive = Layer.effect(UserServiceTag, makeUserService).pipe(
  Layer.provide(UnifiedApiClientLive),
  Layer.provide(DatabaseServiceLive),
  Layer.provide(LoggerServiceLive),
);
