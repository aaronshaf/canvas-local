import { Effect, Context, Layer } from 'effect'
import { UnifiedApiClientService, UnifiedApiClientLive } from '../api/client/unified-client'
import { DatabaseService, DatabaseServiceLive } from './database'
import { LoggerService, LoggerServiceLive } from './logger'
import { User } from '../schemas/user'
import { NotFoundError } from '../core/errors'
import { graphql } from '../api/graphql/generated'

export interface UserService {
  readonly getCurrentUser: () => Effect.Effect<User, NotFoundError>
  readonly getUserById: (userId: string) => Effect.Effect<User, NotFoundError>
  readonly updateLocalUser: (user: User) => Effect.Effect<void>
  readonly getCachedUser: (userId: string) => Effect.Effect<User | null>
}

export class UserServiceTag extends Context.Tag('UserService')<
  UserServiceTag,
  UserService
>() {}

const makeUserService = Effect.gen(function* () {
  const apiClient = yield* UnifiedApiClientService
  const database = yield* DatabaseService
  const logger = yield* LoggerService

  const getCurrentUser = () =>
    Effect.gen(function* () {
      yield* logger.info('Fetching current user')

      // Try GraphQL first
      if (apiClient.preferGraphQL) {
        try {
          const query = graphql(`
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
          `)
          const result = yield* apiClient.query(query, {})
          
          if (result.legacyNode?.__typename === 'User') {
            const userData = result.legacyNode
            const user: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email || '',
              avatar_url: userData.avatarUrl || undefined,
              pronouns: userData.pronouns || undefined,
              login_id: userData.loginId || undefined,
              sis_user_id: userData.sisId || undefined,
            }

            yield* updateLocalUser(user)
            return user
          }
        } catch (error) {
          yield* logger.warn('GraphQL query failed, falling back to REST', { error })
        }
      }

      // Fall back to REST API
      // biome-ignore lint/suspicious/noExplicitAny: Canvas API response type
      const userData = yield* apiClient.get<any>('/users/self')
      const user: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.primary_email || userData.email || '',
        avatar_url: userData.avatar_url,
        pronouns: userData.pronouns,
        login_id: userData.login_id,
        sis_user_id: userData.sis_user_id,
      }

      yield* updateLocalUser(user)
      return user
    })

  const getUserById = (userId: string) =>
    Effect.gen(function* () {
      yield* logger.info('Fetching user by ID', { userId })

      // Check cache first
      const cached = yield* getCachedUser(userId)
      if (cached) {
        yield* logger.debug('User found in cache', { userId })
        return cached
      }

      // Try GraphQL first
      if (apiClient.preferGraphQL) {
        try {
          const query = graphql(`
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
          `)
          const result = yield* apiClient.query(query, { userId })
          
          if (result.legacyNode?.__typename === 'User') {
            const userData = result.legacyNode
            const user: User = {
              id: userData._id,
              name: userData.name,
              email: userData.email || '',
              avatar_url: userData.avatarUrl || undefined,
              pronouns: userData.pronouns || undefined,
              login_id: userData.loginId || undefined,
              sis_user_id: userData.sisId || undefined,
            }

            yield* updateLocalUser(user)
            return user
          }
        } catch (error) {
          yield* logger.warn('GraphQL query failed, falling back to REST', { error })
        }
      }

      // Fall back to REST API
      // biome-ignore lint/suspicious/noExplicitAny: Canvas API response type
      const userData = yield* apiClient.get<any>(`/users/${userId}`)
      const user: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.primary_email || userData.email || '',
        avatar_url: userData.avatar_url,
        pronouns: userData.pronouns,
        login_id: userData.login_id,
        sis_user_id: userData.sis_user_id,
      }

      yield* updateLocalUser(user)
      return user
    })

  const updateLocalUser = (user: User) =>
    Effect.gen(function* () {
      yield* logger.debug('Updating local user', { userId: user.id })

      yield* Effect.tryPromise({
        try: () =>
          database.execute(
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
            ]
          ),
        catch: (error) => {
          logger.error('Failed to update local user', { error })
          return undefined
        },
      }).pipe(Effect.ignore)
    })

  const getCachedUser = (userId: string) =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          database.query(
            'SELECT * FROM users WHERE id = ? LIMIT 1',
            [userId]
          ),
        catch: () => ({ rows: [] }),
      })

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        avatar_url: row.avatar_url as string | undefined,
        pronouns: row.pronouns as string | undefined,
        login_id: row.login_id as string | undefined,
        sis_user_id: row.sis_id as string | undefined,
      }
    })

  return {
    getCurrentUser,
    getUserById,
    updateLocalUser,
    getCachedUser,
  }
})

export const UserServiceLive = Layer.effect(
  UserServiceTag,
  makeUserService
).pipe(
  Layer.provide(UnifiedApiClientLive),
  Layer.provide(DatabaseServiceLive),
  Layer.provide(LoggerServiceLive)
)