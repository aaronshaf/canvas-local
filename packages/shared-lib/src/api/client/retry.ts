import { Duration, Effect, Schedule, pipe } from 'effect';
import type { AppError } from '../../core/errors';

export interface RetryPolicy {
  readonly shouldRetry: (error: AppError) => boolean;
  readonly schedule: Schedule.Schedule<Duration.Duration, AppError>;
}

export const defaultRetryPolicy: RetryPolicy = {
  shouldRetry: (error) => {
    // Retry on network errors and rate limits
    if (error._tag === 'NetworkError' || error._tag === 'RateLimitError') {
      return true;
    }

    // Retry on 5xx server errors
    if (error._tag === 'CanvasApiError' && error.status && error.status >= 500) {
      return true;
    }

    // Don't retry on client errors (4xx) except rate limits
    return false;
  },

  schedule: pipe(
    Schedule.exponential(Duration.seconds(1)),
    Schedule.intersect(Schedule.recurs(3)),
    Schedule.addDelay(() => Duration.millis(Math.random() * 1000)), // Add jitter
  ) as unknown as Schedule.Schedule<Duration.Duration, AppError>,
};

export const withRetry = <R, E extends AppError, A>(
  effect: Effect.Effect<A, E, R>,
  policy: RetryPolicy = defaultRetryPolicy,
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.retry({
      while: policy.shouldRetry,
      schedule: policy.schedule,
    }),
  );

export const withRateLimitRetry = <R, E extends AppError, A>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.catchIf(
      (error): error is E => error._tag === 'RateLimitError',
      (error) => {
        const rateLimitError = error as AppError & { _tag: 'RateLimitError'; retryAfter?: number };
        return pipe(
          Effect.logWarning(`Rate limit hit, waiting ${rateLimitError.retryAfter || 60} seconds`),
          Effect.flatMap(() => Effect.sleep(Duration.seconds(rateLimitError.retryAfter || 60))),
          Effect.flatMap(() => effect),
        );
      },
    ),
  );
