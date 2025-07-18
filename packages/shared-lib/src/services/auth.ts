import { Context, Effect, Layer, Option, Ref, Schema } from 'effect';
import { UnifiedApiClientLive, UnifiedApiClientService } from '../api/client/unified-client';
import { AuthenticationError } from '../core/errors';
import { DatabaseServiceLive, DatabaseServiceTag } from './database';
import { LoggerServiceLive, LoggerServiceTag } from './logger';

export const AuthToken = Schema.Struct({
  accessToken: Schema.String,
  refreshToken: Schema.OptionFromNullOr(Schema.String),
  expiresAt: Schema.OptionFromNullOr(Schema.Number),
  scope: Schema.OptionFromNullOr(Schema.String),
});

export type AuthToken = Schema.Schema.Type<typeof AuthToken>;

export const AuthState = Schema.Struct({
  isAuthenticated: Schema.Boolean,
  token: Schema.OptionFromNullOr(AuthToken),
  userId: Schema.OptionFromNullOr(Schema.String),
  baseUrl: Schema.OptionFromNullOr(Schema.String),
});

export type AuthState = Schema.Schema.Type<typeof AuthState>;

export interface AuthService {
  readonly authenticate: (
    baseUrl: string,
    accessToken: string,
  ) => Effect.Effect<AuthState, AuthenticationError, never>;

  readonly authenticateOAuth: (
    baseUrl: string,
    authCode: string,
    clientId: string,
    clientSecret: string,
  ) => Effect.Effect<AuthState, AuthenticationError, never>;

  readonly logout: () => Effect.Effect<void, never, never>;

  readonly getAuthState: () => Effect.Effect<AuthState, never, never>;

  readonly refreshToken: () => Effect.Effect<AuthToken, AuthenticationError, never>;

  readonly validateToken: () => Effect.Effect<boolean, AuthenticationError, never>;
}

export class AuthServiceTag extends Context.Tag('AuthService')<AuthServiceTag, AuthService>() {}

const makeAuthService = Effect.gen(function* () {
  const logger = yield* LoggerServiceTag;
  const database = yield* DatabaseServiceTag;
  const apiClient = yield* UnifiedApiClientService;

  // Initialize auth state
  const authStateRef = yield* Ref.make<AuthState>({
    isAuthenticated: false,
    token: Option.none(),
    userId: Option.none(),
    baseUrl: Option.none(),
  });

  // Load saved auth state from database
  yield* Effect.gen(function* () {
    try {
      const result = yield* database.execute(
        'SELECT * FROM auth_tokens WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1',
      );

      if (result.rows.length > 0) {
        interface AuthTokenRow {
          access_token: string;
          refresh_token: string | null;
          expires_at: number | null;
          scope: string | null;
          user_id: string | null;
          base_url: string | null;
        }
        const row = result.rows[0] as AuthTokenRow;
        const token: AuthToken = {
          accessToken: row.access_token,
          refreshToken: Option.fromNullable(row.refresh_token),
          expiresAt: Option.fromNullable(row.expires_at),
          scope: Option.fromNullable(row.scope),
        };

        yield* Ref.set(authStateRef, {
          isAuthenticated: true,
          token: Option.some(token),
          userId: Option.fromNullable(row.user_id),
          baseUrl: Option.fromNullable(row.base_url),
        });
      }
    } catch {
      yield* logger.error('Failed to load auth state');
    }
  }).pipe(Effect.ignore);

  const authenticate = (baseUrl: string, accessToken: string) =>
    Effect.gen(function* () {
      yield* logger.info('Authenticating with access token');

      // Validate the token by making a test API call

      interface CanvasUserResponse {
        id: number;
        name: string;
        email?: string;
      }

      const user = yield* apiClient.get<CanvasUserResponse>('/users/self').pipe(
        Effect.catchAll(() =>
          Effect.fail(
            new AuthenticationError({
              message: 'Invalid access token',
              code: 'INVALID_TOKEN',
            }),
          ),
        ),
      );

      const token: AuthToken = {
        accessToken,
        refreshToken: Option.none(),
        expiresAt: Option.none(),
        scope: Option.none(),
      };

      const newState: AuthState = {
        isAuthenticated: true,
        token: Option.some(token),
        userId: Option.some(String(user.id)),
        baseUrl: Option.some(baseUrl),
      };

      // Save to database
      yield* database
        .execute(
          `INSERT INTO auth_tokens (access_token, user_id, base_url, is_active, created_at)
         VALUES (?, ?, ?, 1, datetime('now'))`,
          [accessToken, user.id, baseUrl],
        )
        .pipe(
          Effect.catchAll(() =>
            Effect.fail(
              new AuthenticationError({
                message: 'Failed to save authentication',
                code: 'SAVE_FAILED',
              }),
            ),
          ),
        );

      yield* Ref.set(authStateRef, newState);
      yield* logger.info('Authentication successful', { userId: user.id });

      return newState;
    });

  const authenticateOAuth = (
    baseUrl: string,
    authCode: string,
    clientId: string,
    clientSecret: string,
  ) =>
    Effect.gen(function* () {
      yield* logger.info('Authenticating with OAuth');

      // Exchange auth code for access token
      const response = yield* Effect.tryPromise({
        try: async () => {
          const tokenUrl = `${baseUrl}/login/oauth2/token`;
          const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            client_id: clientId,
            client_secret: clientSecret,
          });

          const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });

          if (!res.ok) {
            throw new Error(`OAuth token exchange failed: ${res.status}`);
          }

          return res.json();
        },
        catch: () =>
          new AuthenticationError({
            message: 'OAuth token exchange failed',
            code: 'OAUTH_FAILED',
          }),
      });

      const accessToken = response.access_token;
      const refreshToken = response.refresh_token;
      const expiresIn = response.expires_in;

      return yield* authenticate(baseUrl, accessToken).pipe(
        Effect.map((state) => ({
          ...state,
          token: Option.some({
            ...Option.getOrElse(state.token, () => ({
              accessToken: '',
              refreshToken: Option.none(),
              expiresAt: Option.none(),
              scope: Option.none(),
            })),
            refreshToken: Option.fromNullable(refreshToken),
            expiresAt: Option.some(Date.now() + expiresIn * 1000),
          }),
        })),
      );
    });

  const logout = () =>
    Effect.gen(function* () {
      yield* logger.info('Logging out');

      // Mark all tokens as inactive
      yield* database
        .execute('UPDATE auth_tokens SET is_active = 0')
        .pipe(Effect.catchAll(() => Effect.succeed(undefined)));

      yield* Ref.set(authStateRef, {
        isAuthenticated: false,
        token: Option.none(),
        userId: Option.none(),
        baseUrl: Option.none(),
      });
    });

  const getAuthState = () => Ref.get(authStateRef);

  const refreshToken = () =>
    Effect.gen(function* () {
      const state = yield* getAuthState();

      if (!state.isAuthenticated || Option.isNone(state.token)) {
        return yield* Effect.fail(
          new AuthenticationError({
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          }),
        );
      }

      const currentToken = Option.getOrThrow(state.token);
      // const refreshTokenValue = Option.getOrElse(currentToken.refreshToken, () => {
      //   throw new AuthenticationError({
      //     message: 'No refresh token available',
      //     code: 'NO_REFRESH_TOKEN',
      //   });
      // });

      // TODO: Implement refresh token logic
      yield* logger.warn('Refresh token not implemented');

      return currentToken;
    });

  const validateToken = () =>
    Effect.gen(function* () {
      const state = yield* getAuthState();

      if (!state.isAuthenticated || Option.isNone(state.token)) {
        return false;
      }

      const token = Option.getOrThrow(state.token);

      // Check expiration
      if (Option.isSome(token.expiresAt)) {
        const expiresAt = Option.getOrThrow(token.expiresAt);
        if (Date.now() >= expiresAt) {
          yield* logger.info('Token expired');
          return false;
        }
      }

      // Validate with API
      return yield* apiClient.get('/users/self').pipe(
        Effect.map(() => true),
        Effect.catchAll(() => Effect.succeed(false)),
      );
    });

  return {
    authenticate,
    authenticateOAuth,
    logout,
    getAuthState,
    refreshToken,
    validateToken,
  };
});

export const AuthServiceLive = Layer.effect(AuthServiceTag, makeAuthService).pipe(
  Layer.provide(DatabaseServiceLive),
  Layer.provide(LoggerServiceLive),
  Layer.provide(UnifiedApiClientLive),
);
