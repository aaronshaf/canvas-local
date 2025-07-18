import { Data } from 'effect';

export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class AuthenticationError extends Data.TaggedError('AuthenticationError')<{
  readonly message: string;
  readonly code?: string;
}> {}

export class ValidationError extends Data.TaggedError('ValidationError')<{
  readonly message: string;
  readonly field?: string;
  readonly value?: unknown;
}> {}

export class DatabaseError extends Data.TaggedError('DatabaseError')<{
  readonly message: string;
  readonly query?: string;
  readonly cause?: unknown;
}> {}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message: string;
  readonly resource: string;
  readonly id?: string | number;
}> {}

export class RateLimitError extends Data.TaggedError('RateLimitError')<{
  readonly message: string;
  readonly retryAfter?: number;
  readonly limit?: number;
}> {}

export class ConfigurationError extends Data.TaggedError('ConfigurationError')<{
  readonly message: string;
  readonly key?: string;
}> {}

export type AppError =
  | NetworkError
  | AuthenticationError
  | ValidationError
  | DatabaseError
  | NotFoundError
  | RateLimitError
  | ConfigurationError;
