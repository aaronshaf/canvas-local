import { Effect, Layer, Stream } from 'effect';
import type { DatabaseError } from '../core/errors';
import { BaseService, makeServiceTag } from '../core/service';

export interface DatabaseConfig {
  readonly path: string;
  readonly enableWAL: boolean;
  readonly busyTimeout: number;
}

export interface QueryResult<T = unknown> {
  readonly rows: ReadonlyArray<T>;
  readonly lastInsertRowId?: number;
  readonly changes?: number;
}

export interface Transaction {
  readonly execute: <T = unknown>(
    query: string,
    params?: ReadonlyArray<unknown>,
  ) => Effect.Effect<QueryResult<T>, DatabaseError>;
  readonly commit: () => Effect.Effect<void, DatabaseError>;
  readonly rollback: () => Effect.Effect<void, DatabaseError>;
}

export abstract class DatabaseService extends BaseService<DatabaseConfig> {
  readonly _tag = 'DatabaseService';

  abstract execute<T = unknown>(
    query: string,
    params?: ReadonlyArray<unknown>,
  ): Effect.Effect<QueryResult<T>, DatabaseError>;

  abstract transaction<R, E, A>(
    effect: (tx: Transaction) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | DatabaseError, R>;

  abstract executeBatch<T = unknown>(
    queries: ReadonlyArray<{ query: string; params?: ReadonlyArray<unknown> }>,
  ): Effect.Effect<ReadonlyArray<QueryResult<T>>, DatabaseError>;

  abstract stream<T = unknown>(
    query: string,
    params?: ReadonlyArray<unknown>,
    chunkSize?: number,
  ): Stream.Stream<T, DatabaseError>;

  abstract close(): Effect.Effect<void, DatabaseError>;
}

export const DatabaseServiceTag = makeServiceTag<DatabaseService>('DatabaseService');

export class MockDatabaseService extends DatabaseService {
  constructor(config: DatabaseConfig) {
    super({
      name: 'MockDatabaseService',
      version: '1.0.0',
      config,
    });
  }

  execute<T = unknown>(
    _query: string,
    _params?: ReadonlyArray<unknown>,
  ): Effect.Effect<QueryResult<T>, DatabaseError> {
    return Effect.succeed({
      rows: [],
      lastInsertRowId: 1,
      changes: 0,
    });
  }

  transaction<R, E, A>(
    effect: (tx: Transaction) => Effect.Effect<A, E, R>,
  ): Effect.Effect<A, E | DatabaseError, R> {
    const mockTx: Transaction = {
      execute: <T = unknown>(query: string, params?: ReadonlyArray<unknown>) =>
        this.execute<T>(query, params),
      commit: () => Effect.void,
      rollback: () => Effect.void,
    };
    return effect(mockTx);
  }

  executeBatch<T = unknown>(
    _queries: ReadonlyArray<{ query: string; params?: ReadonlyArray<unknown> }>,
  ): Effect.Effect<ReadonlyArray<QueryResult<T>>, DatabaseError> {
    return Effect.succeed([]);
  }

  stream<T = unknown>(
    _query: string,
    _params?: ReadonlyArray<unknown>,
    _chunkSize = 100,
  ): Stream.Stream<T, DatabaseError> {
    return Stream.empty;
  }

  close(): Effect.Effect<void, DatabaseError> {
    return Effect.void;
  }
}

export const makeMockDatabaseLayer = (config: DatabaseConfig): Layer.Layer<DatabaseService> =>
  Layer.succeed(DatabaseServiceTag, new MockDatabaseService(config));
