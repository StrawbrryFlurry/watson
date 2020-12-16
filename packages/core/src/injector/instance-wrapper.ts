import { Type } from '@watson/common';

import { Module } from './module';

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

  constructor(
    name: string,
    metatype: Type,
    host: Module,
    instance: T,
    isResolved: boolean = false
  ) {
    this.name = name;
    this.metatype = metatype;
    this.host = host;
    this.instance = instance;
    this.isResolved = isResolved;
  }

  public setInstance(instance: Type) {
    this.instance = (instance as unknown) as T;
    this.isResolved = true;
  }
}
