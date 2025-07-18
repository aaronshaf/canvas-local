import { Effect, pipe, Duration, Schedule, Ref } from 'effect'
import type { ApiRequest, ApiResponse } from './types'
import { CanvasApiError, type AppError } from '../../core/errors'
import { LoggerServiceTag } from '../../services/logger'

export interface RequestInterceptor {
  readonly onRequest: (
    request: ApiRequest
  ) => Effect.Effect<ApiRequest, never>
}

export interface ResponseInterceptor<E = AppError> {
  readonly onResponse: <T>(
    response: ApiResponse<T>
  ) => Effect.Effect<ApiResponse<T>, E>
  
  readonly onError: (
    error: E,
    request: ApiRequest
  ) => Effect.Effect<never, E>
}

export const loggingInterceptor: RequestInterceptor & ResponseInterceptor = {
  onRequest: (request) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag
      
      yield* logger.debug('API Request', {
        method: request.method,
        path: request.path,
        params: request.params,
        hasBody: !!request.body,
      })
      
      return request
    }),

  onResponse: <T>(response: ApiResponse<T>) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag
      
      yield* logger.debug('API Response', {
        status: response.status,
        hasData: !!response.data,
      })
      
      return response
    }),

  onError: (error, request) =>
    Effect.gen(function* () {
      const logger = yield* LoggerServiceTag
      
      yield* logger.error('API Error', {
        error,
        request: {
          method: request.method,
          path: request.path,
        },
      })
      
      return yield* Effect.fail(error)
    }),
}

export const retryInterceptor = (
  maxRetries: number = 3,
  baseDelay: Duration.Duration = Duration.seconds(1)
): ResponseInterceptor => ({
  onResponse: (response) => Effect.succeed(response),
  
  onError: (error, request) => {
    if (error._tag === 'RateLimitError' || error._tag === 'NetworkError') {
      const schedule = pipe(
        Schedule.exponential(baseDelay),
        Schedule.intersect(Schedule.recurs(maxRetries))
      )
      
      return Effect.fail(error)
    }
    
    return Effect.fail(error)
  },
})

interface RateLimitState {
  readonly remaining: number
  readonly reset: number
  readonly limit: number
}

export const rateLimitInterceptor = (): ResponseInterceptor => {
  const stateRef = Ref.unsafeMake<RateLimitState>({
    remaining: 200,
    reset: Date.now() + 3600000,
    limit: 200,
  })

  return {
    onResponse: <T>(response: ApiResponse<T>) =>
      Effect.gen(function* () {
        const remaining = response.headers['x-rate-limit-remaining']
        const reset = response.headers['x-rate-limit-reset']
        const limit = response.headers['x-rate-limit-limit']

        if (remaining && reset && limit) {
          yield* Ref.set(stateRef, {
            remaining: parseInt(remaining, 10),
            reset: parseInt(reset, 10) * 1000,
            limit: parseInt(limit, 10),
          })
        }

        return response
      }),

    onError: (error, request) =>
      Effect.gen(function* () {
        if (error._tag === 'RateLimitError') {
          const state = yield* Ref.get(stateRef)
          const waitTime = Math.max(0, state.reset - Date.now())
          
          const logger = yield* LoggerServiceTag
          yield* logger.warn('Rate limit hit, waiting', {
            waitTime,
            reset: new Date(state.reset).toISOString(),
          })
          
          yield* Effect.sleep(Duration.millis(waitTime))
          
          // Reset the state after waiting
          yield* Ref.set(stateRef, {
            ...state,
            remaining: state.limit,
            reset: Date.now() + 3600000,
          })
        }
        
        return yield* Effect.fail(error)
      }),
  }
}

export const authRefreshInterceptor = (
  refreshToken: () => Effect.Effect<string, never>
): ResponseInterceptor => ({
  onResponse: (response) => Effect.succeed(response),
  
  onError: (error, request) =>
    Effect.gen(function* () {
      if (error._tag === 'AuthenticationError' && error.code === 'UNAUTHORIZED') {
        const logger = yield* LoggerServiceTag
        yield* logger.info('Refreshing authentication token')
        
        const newToken = yield* refreshToken()
        
        // Update the request with the new token
        const updatedRequest: ApiRequest = {
          ...request,
          headers: {
            ...request.headers,
            Authorization: `Bearer ${newToken}`,
          },
        }
        
        // Retry the request with the new token
        // Note: This would need to be implemented in the actual client
        // For now, we'll just fail with the original error
        return yield* Effect.fail(error)
      }
      
      return yield* Effect.fail(error)
    }),
})

export const combineInterceptors = (
  ...interceptors: Array<RequestInterceptor | ResponseInterceptor>
): { request: RequestInterceptor; response: ResponseInterceptor } => {
  const requestInterceptors = interceptors.filter(
    (i): i is RequestInterceptor => 'onRequest' in i
  )
  
  const responseInterceptors = interceptors.filter(
    (i): i is ResponseInterceptor => 'onResponse' in i
  )

  return {
    request: {
      onRequest: (request) =>
        requestInterceptors.reduce(
          (effect, interceptor) =>
            effect.pipe(Effect.flatMap(interceptor.onRequest)),
          Effect.succeed(request)
        ),
    },
    response: {
      onResponse: <T>(response: ApiResponse<T>) =>
        responseInterceptors.reduce(
          (effect, interceptor) =>
            effect.pipe(Effect.flatMap(interceptor.onResponse)),
          Effect.succeed(response)
        ),
      onError: (error, request) =>
        responseInterceptors.reduce(
          (effect, interceptor) =>
            effect.pipe(
              Effect.catchAll((e) => interceptor.onError(e, request))
            ),
          Effect.fail(error) as Effect.Effect<never, CanvasApiError>
        ),
    },
  }
}