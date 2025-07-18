import { Effect, Context, Layer, Config } from 'effect'
import { Client, cacheExchange, fetchExchange, type OperationResult } from '@urql/core'
import type { GraphQLClient } from './types'
import { CanvasApiError, NetworkError, AuthenticationError, RateLimitError, type AppError } from '../../core/errors'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

export class GraphQLClientService extends Context.Tag('GraphQLClientService')<
  GraphQLClientService,
  GraphQLClient
>() {}

interface GraphQLClientConfig {
  readonly baseUrl: string
  readonly accessToken: string
}

const createUrqlClient = (config: GraphQLClientConfig): Client => {
  return new Client({
    url: `${config.baseUrl}/api/graphql`,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  })
}

const handleGraphQLErrors = <T>(result: OperationResult<T>): Effect.Effect<T, AppError> => {
  if (result.error) {
    const networkError = result.error.networkError
    const graphQLErrors = result.error.graphQLErrors

    if (networkError) {
      // biome-ignore lint/suspicious/noExplicitAny: networkError type is not fully typed
      const statusCode = (networkError as any)?.response?.status

      if (statusCode === 401) {
        return Effect.fail(
          new AuthenticationError({
            message: 'Invalid or expired access token',
            code: 'UNAUTHORIZED',
          })
        )
      }

      if (statusCode === 429) {
        // biome-ignore lint/suspicious/noExplicitAny: networkError type is not fully typed
        const retryAfter = (networkError as any)?.response?.headers?.get('X-Rate-Limit-Reset')
        return Effect.fail(
          new RateLimitError({
            message: 'API rate limit exceeded',
            retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined,
          })
        )
      }

      return Effect.fail(
        new NetworkError({
          message: networkError.message || 'Network error occurred',
          cause: networkError,
        })
      )
    }

    if (graphQLErrors && graphQLErrors.length > 0) {
      const firstError = graphQLErrors[0]
      return Effect.fail(
        new CanvasApiError({
          message: firstError.message,
          errors: graphQLErrors.map((err) => ({
            message: err.message,
            field: err.path?.join('.'),
          })),
        })
      )
    }

    return Effect.fail(
      new CanvasApiError({
        message: 'Unknown GraphQL error occurred',
      })
    )
  }

  if (!result.data) {
    return Effect.fail(
      new CanvasApiError({
        message: 'No data returned from GraphQL query',
      })
    )
  }

  return Effect.succeed(result.data)
}

export const makeGraphQLClient = (config: GraphQLClientConfig): GraphQLClient => {
  const client = createUrqlClient(config)

  return {
    query: <TData, TVariables = Record<string, unknown>>(
      query: string | TypedDocumentNode<TData, TVariables>,
      variables?: TVariables
    ) =>
      Effect.tryPromise({
        try: () => client.query(query, variables || {}).toPromise(),
        catch: (error) =>
          new NetworkError({
            message: 'Failed to execute GraphQL query',
            cause: error,
          }),
      }).pipe(Effect.flatMap(handleGraphQLErrors)),

    mutation: <TData, TVariables = Record<string, unknown>>(
      mutation: string | TypedDocumentNode<TData, TVariables>,
      variables?: TVariables
    ) =>
      Effect.tryPromise({
        try: () => client.mutation(mutation, variables || {}).toPromise(),
        catch: (error) =>
          new NetworkError({
            message: 'Failed to execute GraphQL mutation',
            cause: error,
          }),
      }).pipe(Effect.flatMap(handleGraphQLErrors)),
  }
}

export const GraphQLClientLive = Layer.effect(
  GraphQLClientService,
  Effect.gen(function* () {
    const baseUrl = yield* Config.string('CANVAS_API_URL')
    const accessToken = yield* Config.string('CANVAS_ACCESS_TOKEN')

    return makeGraphQLClient({ baseUrl, accessToken })
  })
)