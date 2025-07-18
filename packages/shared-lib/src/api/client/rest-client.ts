import { Config, Context, Effect, Layer, pipe } from 'effect';
import {
  type AppError,
  AuthenticationError,
  CanvasApiError,
  NetworkError,
  RateLimitError,
} from '../../core/errors';
import { withRateLimitRetry, withRetry } from './retry';
import type { ApiClient, ApiRequest, ApiResponse } from './types';

export class RestClientService extends Context.Tag('RestClientService')<
  RestClientService,
  ApiClient
>() {}

interface RestClientConfig {
  readonly baseUrl: string;
  readonly accessToken: string;
  readonly apiVersion?: string;
  readonly timeout?: number;
}

const buildUrl = (baseUrl: string, path: string, params?: Record<string, unknown>): string => {
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
};

const parseHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

const parseLinkHeader = (
  linkHeader: string | null,
): { next?: string; prev?: string; first?: string; last?: string } => {
  const links: Record<string, string> = {};
  if (!linkHeader) return links;

  const linkPattern = /<([^>]+)>;\s*rel="([^"]+)"/g;
  let match: RegExpExecArray | null = linkPattern.exec(linkHeader);

  while (match !== null) {
    const url = match[1];
    const rel = match[2];
    if (rel && url) {
      links[rel] = url;
    }
    match = linkPattern.exec(linkHeader);
  }

  return links;
};

const handleHttpError = (response: Response, endpoint: string): Effect.Effect<never, AppError> => {
  if (response.status === 401) {
    return Effect.fail(
      new AuthenticationError({
        message: 'Invalid or expired access token',
        code: 'UNAUTHORIZED',
      }),
    );
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get('X-Rate-Limit-Reset');
    return Effect.fail(
      new RateLimitError({
        message: 'API rate limit exceeded',
        retryAfter: retryAfter ? Number.parseInt(retryAfter, 10) : undefined,
      }),
    );
  }

  return Effect.tryPromise({
    try: async () => {
      const errorBody = await response.text();
      let errors: Array<{ field?: string; message: string }> = [];

      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.errors) {
          errors = Array.isArray(parsed.errors)
            ? parsed.errors
            : Object.entries(parsed.errors).map(([field, messages]) => ({
                field,
                message: Array.isArray(messages) ? messages.join(', ') : String(messages),
              }));
        }
      } catch {
        // If parsing fails, use the raw error body
      }

      return new CanvasApiError({
        message: `API request failed with status ${response.status}`,
        status: response.status,
        endpoint,
        errors: errors.length > 0 ? errors : undefined,
      });
    },
    catch: () =>
      new CanvasApiError({
        message: `API request failed with status ${response.status}`,
        status: response.status,
        endpoint,
      }),
  }).pipe(Effect.flatMap(Effect.fail));
};

export const makeRestClient = (config: RestClientConfig): ApiClient => {
  const rawRequest = <T>(req: ApiRequest): Effect.Effect<ApiResponse<T>, AppError> =>
    Effect.tryPromise({
      try: async () => {
        const url = buildUrl(config.baseUrl, `/api/v1${req.path}`, req.params);
        const headers: Record<string, string> = {
          Authorization: `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...req.headers,
        };

        const controller = new AbortController();
        const timeoutId = config.timeout
          ? setTimeout(() => controller.abort(), config.timeout)
          : undefined;

        try {
          const response = await fetch(url, {
            method: req.method,
            headers,
            body: req.body ? JSON.stringify(req.body) : undefined,
            signal: controller.signal,
          });

          if (timeoutId) clearTimeout(timeoutId);

          if (!response.ok) {
            return await Effect.runPromise(handleHttpError(response, req.path));
          }

          const data = await response.json();

          return {
            data: data as T,
            headers: parseHeaders(response.headers),
            status: response.status,
          };
        } catch (error) {
          if (timeoutId) clearTimeout(timeoutId);
          throw error;
        }
      },
      catch: (error) => {
        if (error instanceof CanvasApiError) {
          return error;
        }
        return new NetworkError({
          message: 'Network request failed',
          cause: error,
        });
      },
    });

  const request = <T>(req: ApiRequest): Effect.Effect<ApiResponse<T>, AppError> =>
    pipe(rawRequest<T>(req), withRetry, withRateLimitRetry);

  return {
    request,

    get: <T>(path: string, params?: Record<string, unknown>) =>
      request<T>({ method: 'GET', path, params }).pipe(Effect.map((response) => response.data)),

    post: <T>(path: string, body?: unknown, params?: Record<string, unknown>) =>
      request<T>({ method: 'POST', path, body, params }).pipe(
        Effect.map((response) => response.data),
      ),

    put: <T>(path: string, body?: unknown, params?: Record<string, unknown>) =>
      request<T>({ method: 'PUT', path, body, params }).pipe(
        Effect.map((response) => response.data),
      ),

    delete: <T>(path: string, params?: Record<string, unknown>) =>
      request<T>({ method: 'DELETE', path, params }).pipe(Effect.map((response) => response.data)),

    paginate: <T>(path: string, params?: Record<string, unknown>) =>
      pipe(
        request<T[]>({ method: 'GET', path, params }),
        Effect.map((response) => {
          const links = parseLinkHeader(response.headers.link || null);

          return {
            items: response.data,
            pageInfo: {
              hasNextPage: !!links.next,
              endCursor: links.next
                ? new URL(links.next).searchParams.get('page') || undefined
                : undefined,
            },
          };
        }),
      ),
  };
};

export const RestClientLive = Layer.effect(
  RestClientService,
  Effect.gen(function* () {
    const baseUrl = yield* Config.string('CANVAS_API_URL');
    const accessToken = yield* Config.string('CANVAS_ACCESS_TOKEN');
    const timeout = yield* Config.number('API_TIMEOUT').pipe(
      Effect.orElse(() => Effect.succeed(30000)),
    );

    return makeRestClient({ baseUrl, accessToken, timeout });
  }),
);
