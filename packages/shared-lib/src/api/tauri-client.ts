import { invoke } from '@tauri-apps/api/core';
import { Effect } from 'effect';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export interface RestRequest {
  method: string;
  path: string;
  params?: Record<string, unknown>;
  body?: unknown;
}

interface GraphQLError {
  message: string;
  extensions?: Record<string, unknown>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export const TauriApiClient = {
  graphql: <T = unknown>(request: GraphQLRequest): Effect.Effect<T, Error, never> =>
    Effect.tryPromise({
      try: () => invoke<GraphQLResponse<T>>('graphql_request', { request }),
      catch: (error) => new Error(`GraphQL request failed: ${error}`),
    }).pipe(
      Effect.flatMap((response) => {
        if (response.errors && response.errors.length > 0) {
          return Effect.fail(new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`));
        }
        if (!response.data) {
          return Effect.fail(new Error('No data returned from GraphQL request'));
        }
        return Effect.succeed(response.data);
      }),
    ),

  rest: <T = unknown>(request: RestRequest): Effect.Effect<T, Error, never> =>
    Effect.tryPromise({
      try: () => invoke<T>('rest_request', { request }),
      catch: (error) => new Error(`REST request failed: ${error}`),
    }),
};
