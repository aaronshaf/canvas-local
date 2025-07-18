import { Effect, Layer } from 'effect';
import { BaseService, makeServiceTag } from '../core/service';

export interface LogLevel {
  readonly _tag: 'Debug' | 'Info' | 'Warn' | 'Error';
}

export interface LogEntry {
  readonly level: LogLevel['_tag'];
  readonly message: string;
  readonly timestamp: Date;
  readonly context?: Record<string, unknown>;
  readonly error?: unknown;
}

export interface LoggerConfig {
  readonly minLevel: LogLevel['_tag'];
  readonly enableConsole: boolean;
  readonly enableFile: boolean;
  readonly filePath?: string;
}

export class LoggerService extends BaseService<LoggerConfig> {
  readonly _tag = 'LoggerService';

  private shouldLog(level: LogLevel['_tag']): boolean {
    const levels: LogLevel['_tag'][] = ['Debug', 'Info', 'Warn', 'Error'];
    const minIndex = levels.indexOf(this.config.config?.minLevel || 'Info');
    const levelIndex = levels.indexOf(level);
    return levelIndex >= minIndex;
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? ` [${String(entry.error)}]` : '';
    return `[${timestamp}] [${entry.level}] ${entry.message}${context}${error}`;
  }

  log(
    level: LogLevel['_tag'],
    message: string,
    context?: Record<string, unknown>,
    error?: unknown,
  ): Effect.Effect<void> {
    return Effect.sync(() => {
      if (!this.shouldLog(level)) return;

      const entry: LogEntry = {
        level,
        message,
        timestamp: new Date(),
        context,
        error,
      };

      if (this.config.config?.enableConsole) {
        const formatted = this.formatLog(entry);
        switch (level) {
          case 'Debug':
            console.debug(formatted);
            break;
          case 'Info':
            console.info(formatted);
            break;
          case 'Warn':
            console.warn(formatted);
            break;
          case 'Error':
            console.error(formatted);
            break;
        }
      }
    });
  }

  debug(message: string, context?: Record<string, unknown>): Effect.Effect<void> {
    return this.log('Debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): Effect.Effect<void> {
    return this.log('Info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): Effect.Effect<void> {
    return this.log('Warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): Effect.Effect<void> {
    return this.log('Error', message, context, error);
  }
}

export const LoggerServiceTag = makeServiceTag<LoggerService>('LoggerService');

export const makeLoggerLayer = (config: LoggerConfig): Layer.Layer<LoggerService> =>
  Layer.succeed(
    LoggerServiceTag,
    new LoggerService({
      name: 'LoggerService',
      version: '1.0.0',
      config,
    }),
  );
