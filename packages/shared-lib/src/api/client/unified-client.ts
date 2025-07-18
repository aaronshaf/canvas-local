import { Effect, Context, Layer, pipe } from 'effect'
import type { UnifiedApiClient } from './types'
import { GraphQLClientService, GraphQLClientLive } from './graphql-client'
import { RestClientService, RestClientLive } from './rest-client'

export class UnifiedApiClientService extends Context.Tag('UnifiedApiClientService')<
  UnifiedApiClientService,
  UnifiedApiClient
>() {}

export const UnifiedApiClientLive = Layer.effect(
  UnifiedApiClientService,
  Effect.gen(function* () {
    const graphQLClient = yield* GraphQLClientService
    const restClient = yield* RestClientService

    return {
      ...restClient,
      ...graphQLClient,
      preferGraphQL: true,
    }
  })
).pipe(
  Layer.provide(GraphQLClientLive),
  Layer.provide(RestClientLive)
)