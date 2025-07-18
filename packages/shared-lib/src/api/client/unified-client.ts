import { Context, Effect, Layer, pipe } from 'effect';
import { GraphQLClientLive, GraphQLClientService } from './graphql-client';
import { RestClientLive, RestClientService } from './rest-client';
import type { UnifiedApiClient } from './types';

export class UnifiedApiClientService extends Context.Tag('UnifiedApiClientService')<
  UnifiedApiClientService,
  UnifiedApiClient
>() {}

export const UnifiedApiClientLive = Layer.effect(
  UnifiedApiClientService,
  Effect.gen(function* () {
    const graphQLClient = yield* GraphQLClientService;
    const restClient = yield* RestClientService;

    return {
      ...restClient,
      ...graphQLClient,
      preferGraphQL: true,
    };
  }),
).pipe(Layer.provide(GraphQLClientLive), Layer.provide(RestClientLive));
