import { Type } from '@watsonjs/common';

import { Module } from './module';

export interface IInstanceWrapperArgs<T = any> {
  name: string;
  metatype: Type | Function | any;
  host: Module;
  isResolved?: boolean;
  instance?: T;
  inject?: unknown[];
}

export type TInstanceFactory<T, D extends any[]> = (...deps: D) => T;

// TODO:
// Use custom DI tokens + factory and deps
// ~ Rewrite ctor?

/**
 * Wraps around Provicer, Receiver and Module instaces
 * Provides init options and dependencies
 */
export class InstanceWrapper<T = any, D extends any[] = unknown[]> {
  public readonly name: string;
  public readonly metatype: Type;
  public readonly host: Module;
  /**
   * The factory function resolves
   * the type to its value using
   * using dependencies if necessary
   */
  public readonly factory: TInstanceFactory<T, D>;
  /**
   * Dependencies of the factory
   */
  public readonly deps?: D;

  public isResolved: boolean;
  public instance: T;
  public inject?: Type[];

  constructor(args: IInstanceWrapperArgs) {
    this.init(args);
  }

  private init(withData: IInstanceWrapperArgs) {
    const isResolved = withData.isResolved || false;

    Object.assign(this, { ...withData, isResolved });
  }

  public setInstance(instance: Type) {
    this.instance = (instance as unknown) as T;
    this.isResolved = true;
  }
}
