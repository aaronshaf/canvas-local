import { Context } from 'effect';

export interface ServiceConfig<T> {
  readonly name: string;
  readonly version: string;
  readonly config?: T;
}

export abstract class BaseService<T = unknown> {
  abstract readonly _tag: string;

  constructor(readonly config: ServiceConfig<T>) {}

  protected get name(): string {
    return this.config.name;
  }

  protected get version(): string {
    return this.config.version;
  }
}

export const makeServiceTag = <T extends BaseService>(name: string) => Context.GenericTag<T>(name);
