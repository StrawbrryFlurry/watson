import { Module } from './module';

// Base injector
export abstract class Injector {
  public readonly parent: Injector | null;
  public readonly module: Module;
  protected readonly _records: Map<any, any> = new Map<any, any>();

  constructor(module: Module, parent?: Injector) {}

  public abstract create<T extends any>(...args: any[]): T;
  public abstract get(typeOrToken: any): any;
}
