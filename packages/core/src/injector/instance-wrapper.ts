import { Type } from '@watson/common';

import { Module } from './module';

export interface IInstanceWrapperArgs<T = any> {
  name: string;
  metatype: Type | Function | any;
  host: Module;
  isResolved?: boolean;
  instance?: T;
  inject?: unknown[];
}

/**
 * Wraps around Provicer, Receiver and Module instaces
 * Provides init options and dependencies
 */
export class InstanceWrapper<T = any> {
  public readonly name: string;
  public readonly metatype: Type;
  public readonly host: Module;
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
