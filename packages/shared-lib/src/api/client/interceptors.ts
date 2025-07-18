import { Duration, Effect, Ref } from 'effect';
import type { AppError } from '../../core/errors';
import { type LoggerService, LoggerServiceTag } from '../../services/logger';
import type { ApiRequest, ApiResponse } from './types';

export interface RequestInterceptor<R = never> {
  readonly onRequest: (request: ApiRequest) => Effect.Effect<ApiRequest, never, R>;
}

export interface ResponseInterceptor<E = AppError, R = never> {
  readonly onResponse: <T>(response: ApiResponse<T>) => Effect.Effect<ApiResponse<T>, E, R>;

  readonly onError: (error: E, request: ApiRequest) => Effect.Effect<never, E, R>;
}

export const loggingInterceptor: RequestInterceptor<LoggerService> &
  ResponseInterceptor<AppError, LoggerService> = {
  onRequest: (request) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag;

      yield* logger.debug('API Request', {
        method: request.method,
        path: request.path,
        params: request.params,
        hasBody: !!request.body,
      });

      return request;
    }),

  onResponse: <T>(response: ApiResponse<T>) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag;

      yield* logger.debug('API Response', {
        status: response.status,
        hasData: !!response.data,
      });

      return response;
    }),

  onError: (error, _request) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag;

      yield* logger.error('API Error', {
        error,
      });

      return yield* Effect.fail(error);
    }),
};

export const retryInterceptor = (): ResponseInterceptor => ({
  onResponse: (response) => Effect.succeed(response),

  onError: (error, _request) => {
    if (error._tag === 'RateLimitError' || error._tag === 'NetworkError') {
      // TODO: Implement retry with exponential backoff
      return Effect.fail(error);
    }

    return Effect.fail(error);
  },
});

interface RateLimitState {
  readonly remaining: number;
  readonly reset: number;
  readonly limit: number;
}

export const rateLimitInterceptor = (): ResponseInterceptor<AppError, LoggerService> => {
  const stateRef = Ref.unsafeMake<RateLimitState>({
    remaining: 200,
    reset: Date.now() + 3600000,
    limit: 200,
  });

  return {
    onResponse: <T>(response: ApiResponse<T>) =>
      Effect.gen(function* () {
        const remaining = response.headers['x-rate-limit-remaining'];
        const reset = response.headers['x-rate-limit-reset'];
        const limit = response.headers['x-rate-limit-limit'];

        if (remaining && reset && limit) {
          yield* Ref.set(stateRef, {
            remaining: Number.parseInt(remaining, 10),
            reset: Number.parseInt(reset, 10) * 1000,
            limit: Number.parseInt(limit, 10),
          });
        }

        return response;
      }),

    onError: (error, _request) =>
      Effect.gen(function* () {
        if (error._tag === 'RateLimitError') {
          const state = yield* Ref.get(stateRef);
          const waitTime = Math.max(0, state.reset - Date.now());

          const logger = yield* LoggerServiceTag;
          yield* logger.warn('Rate limit hit, waiting', {
            waitTime,
            reset: new Date(state.reset).toISOString(),
          });

          yield* Effect.sleep(Duration.millis(waitTime));

          // Reset the state after waiting
          yield* Ref.set(stateRef, {
            ...state,
            remaining: state.limit,
            reset: Date.now() + 3600000,
          });
        }

        return yield* Effect.fail(error);
      }),
  };
};

export const authRefreshInterceptor = (
  refreshToken: () => Effect.Effect<string, never>,
): ResponseInterceptor<AppError, LoggerService> => ({
  onResponse: (response) => Effect.succeed(response),

  onError: (error, _request) =>
    Effect.gen(function* () {
      if (error._tag === 'AuthenticationError' && error.code === 'UNAUTHORIZED') {
        const logger = yield* LoggerServiceTag;
        yield* logger.info('Refreshing authentication token');

        yield* refreshToken();

        // TODO: Implement request retry with new token
        // For now, we'll just fail with the original error
        return yield* Effect.fail(error);
      }

      return yield* Effect.fail(error);
    }),
});

// Simplified interceptor types for external use (without dependencies)
// Simplified interceptor types for external use (without dependencies)

export const combineInterceptors = <R1 = never, R2 = never, E = AppError>(
  ...interceptors: Array<RequestInterceptor<R1> | ResponseInterceptor<E, R2>>
): { request: RequestInterceptor<R1>; response: ResponseInterceptor<E, R2> } => {
  const requestInterceptors = interceptors.filter(
    (i): i is RequestInterceptor<R1> => 'onRequest' in i,
  );

  const responseInterceptors = interceptors.filter(
    (i): i is ResponseInterceptor<E, R2> => 'onResponse' in i,
  );

  return {
    request: {
      onRequest: (request) =>
        requestInterceptors.reduce(
          (effect, interceptor) => effect.pipe(Effect.flatMap(interceptor.onRequest)),
          Effect.succeed(request) as Effect.Effect<ApiRequest, never, R1>,
        ),
    },
    response: {
      onResponse: <T>(response: ApiResponse<T>) =>
        responseInterceptors.reduce(
          (effect, interceptor) => effect.pipe(Effect.flatMap(interceptor.onResponse)),
          Effect.succeed(response) as Effect.Effect<ApiResponse<T>, E, R2>,
        ),
      onError: (error, request) =>
        responseInterceptors.reduce(
          (effect, interceptor) =>
            effect.pipe(Effect.catchAll((e) => interceptor.onError(e, request))),
          Effect.fail(error) as Effect.Effect<never, E, R2>,
        ),
    },
  };
};
