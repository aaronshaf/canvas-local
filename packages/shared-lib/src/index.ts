export const version = '0.1.0';

// Core modules
export * from './core/errors';
export * from './core/service';
export * from './core/container';

// Services
export * from './services/logger';
export * from './services/database';

// Database
export * from './database/migrations';
export { migrations } from './database/migrations/index';

// Schemas
export * from './schemas/user';
export * from './schemas/course';
export * from './schemas/assignment';
export * from './schemas/submission';
