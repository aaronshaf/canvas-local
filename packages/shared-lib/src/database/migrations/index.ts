import type { Migration } from '../migrations';
import { initialSchemaMigration } from './001_initial_schema';

export const migrations: ReadonlyArray<Migration> = [initialSchemaMigration];
