import { Context, Effect, Layer, Array as ReadonlyArray } from 'effect';
import { DatabaseError } from '../core/errors';
import { type DatabaseService, DatabaseServiceTag } from '../services/database';
import { type LoggerService, LoggerServiceTag } from '../services/logger';

export interface Migration {
  readonly version: number;
  readonly name: string;
  readonly up: string;
  readonly down?: string;
}

export class MigrationService {
  constructor(
    private readonly database: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  private readonly createMigrationsTable = `
    CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  private getCurrentVersion = (): Effect.Effect<number, DatabaseError> => {
    return this.database
      .execute<{ version: number }>('SELECT MAX(version) as version FROM migrations')
      .pipe(
        Effect.map((result) => result.rows[0]?.version ?? 0),
        Effect.catchTag('DatabaseError', () => Effect.succeed(0)),
      );
  };

  private applyMigration = (migration: Migration): Effect.Effect<void, DatabaseError> => {
    const self = this;
    return self.database.transaction((tx) =>
      Effect.gen(function* (_) {
        yield* _(tx.execute(migration.up));
        yield* _(
          tx.execute('INSERT INTO migrations (version, name) VALUES (?, ?)', [
            migration.version,
            migration.name,
          ]),
        );
        yield* _(self.logger.info(`Applied migration ${migration.version}: ${migration.name}`));
      }),
    );
  };

  private rollbackMigration = (migration: Migration): Effect.Effect<void, DatabaseError> => {
    const self = this;
    if (!migration.down) {
      return Effect.fail(
        new DatabaseError({
          message: `Migration ${migration.version} does not have a rollback`,
        }),
      );
    }

    return self.database.transaction((tx) =>
      Effect.gen(function* (_) {
        yield* _(tx.execute(migration.down));
        yield* _(tx.execute('DELETE FROM migrations WHERE version = ?', [migration.version]));
        yield* _(self.logger.info(`Rolled back migration ${migration.version}: ${migration.name}`));
      }),
    );
  };

  migrate = (migrations: ReadonlyArray<Migration>): Effect.Effect<void, DatabaseError> => {
    const self = this;
    return Effect.gen(function* (_) {
      yield* _(self.logger.info('Starting database migrations'));

      yield* _(self.database.execute(self.createMigrationsTable));

      const currentVersion = yield* _(self.getCurrentVersion());
      const pendingMigrations = ReadonlyArray.filter(
        migrations,
        (m: Migration) => m.version > currentVersion,
      );

      if (ReadonlyArray.isEmptyReadonlyArray(pendingMigrations)) {
        yield* _(self.logger.info('Database is up to date'));
        return;
      }

      const sortedMigrations = ReadonlyArray.sort(
        pendingMigrations,
        (a: Migration, b: Migration) =>
          a.version < b.version ? -1 : a.version > b.version ? 1 : 0,
      );

      for (const migration of sortedMigrations) {
        yield* _(self.applyMigration(migration));
      }

      yield* _(self.logger.info(`Successfully applied ${pendingMigrations.length} migrations`));
    });
  };

  rollback = (
    migrations: ReadonlyArray<Migration>,
    targetVersion = 0,
  ): Effect.Effect<void, DatabaseError> => {
    const self = this;
    return Effect.gen(function* (_) {
      const currentVersion = yield* _(self.getCurrentVersion());

      if (currentVersion <= targetVersion) {
        yield* _(self.logger.info('Nothing to rollback'));
        return;
      }

      const migrationsToRollback = ReadonlyArray.filter(
        migrations,
        (m: Migration) => m.version > targetVersion && m.version <= currentVersion,
      );

      const sortedMigrations = ReadonlyArray.sort(
        migrationsToRollback,
        (a: Migration, b: Migration) =>
          b.version > a.version ? 1 : b.version < a.version ? -1 : 0,
      );

      for (const migration of sortedMigrations) {
        yield* _(self.rollbackMigration(migration));
      }

      yield* _(
        self.logger.info(`Successfully rolled back ${migrationsToRollback.length} migrations`),
      );
    });
  };
}

export const MigrationServiceTag = Context.GenericTag<MigrationService>('MigrationService');

export const makeMigrationServiceLayer: Layer.Layer<
  MigrationService,
  never,
  DatabaseService | LoggerService
> = Layer.effect(
  MigrationServiceTag,
  Effect.gen(function* (_) {
    const database = yield* _(DatabaseServiceTag);
    const logger = yield* _(LoggerServiceTag);
    return new MigrationService(database, logger);
  }),
);
