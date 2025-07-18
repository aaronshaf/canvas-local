import { Context, Layer } from 'effect';
import { type LoggerService, makeLoggerLayer } from '../services/logger';

export interface AppConfig {
  readonly logger: {
    readonly minLevel: 'Debug' | 'Info' | 'Warn' | 'Error';
    readonly enableConsole: boolean;
    readonly enableFile: boolean;
    readonly filePath?: string;
  };
  readonly database: {
    readonly path: string;
    readonly enableWAL: boolean;
    readonly busyTimeout: number;
  };
  readonly api: {
    readonly baseUrl: string;
    readonly timeout: number;
    readonly maxRetries: number;
  };
}

export const AppConfigTag = Context.GenericTag<AppConfig>('AppConfig');

export interface AppServices {
  readonly logger: LoggerService;
}

export const createAppLayer = (config: AppConfig): Layer.Layer<LoggerService | AppConfig> => {
  const configLayer = Layer.succeed(AppConfigTag, config);
  const loggerLayer = makeLoggerLayer(config.logger);

  return Layer.mergeAll(configLayer, loggerLayer);
};

export const makeRuntime = async (config: AppConfig) => {
  const layer = createAppLayer(config);
  return await Layer.toRuntime(layer);
};
