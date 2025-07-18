import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { Effect } from 'effect';
import type { AppError } from '../../core/errors';

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly accessToken: string;
  readonly apiVersion?: string;
  readonly maxRetries?: number;
  readonly retryDelay?: number;
  readonly timeout?: number;
}

export interface ApiRequest {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly path: string;
  readonly params?: Record<string, unknown>;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly headers: Record<string, string>;
  readonly status: number;
}

export interface PaginationInfo {
  readonly hasNextPage: boolean;
  readonly endCursor?: string;
  readonly totalCount?: number;
}

export interface PaginatedResponse<T> {
  readonly items: T[];
  readonly pageInfo: PaginationInfo;
}

export interface ApiClient {
  readonly request: <T>(request: ApiRequest) => Effect.Effect<ApiResponse<T>, AppError>;

  readonly get: <T>(path: string, params?: Record<string, unknown>) => Effect.Effect<T, AppError>;

  readonly post: <T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ) => Effect.Effect<T, AppError>;

  readonly put: <T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ) => Effect.Effect<T, AppError>;

  readonly delete: <T>(
    path: string,
    params?: Record<string, unknown>,
  ) => Effect.Effect<T, AppError>;

  readonly paginate: <T>(
    path: string,
    params?: Record<string, unknown>,
  ) => Effect.Effect<PaginatedResponse<T>, AppError>;
}

export interface GraphQLClient {
  readonly query: <TData, TVariables = Record<string, unknown>>(
    query: string | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
  ) => Effect.Effect<TData, AppError>;

  readonly mutation: <TData, TVariables = Record<string, unknown>>(
    mutation: string | TypedDocumentNode<TData, TVariables>,
    variables?: TVariables,
  ) => Effect.Effect<TData, AppError>;
}

export interface UnifiedApiClient extends ApiClient, GraphQLClient {
  readonly preferGraphQL: boolean;
}
