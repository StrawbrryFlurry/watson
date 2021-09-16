import { ResolvedBinding } from './binding';
import { Providable } from './injection-token';

export abstract class Injector {
  public readonly parent: Injector | null;

  constructor(parent?: Injector) {
    this.parent = parent ?? null;
  }

  /**
   * Resolves`typeOrToken` using
   * tokens provided by itself or
   * the parent injector
   * given there is one.
   */
  public abstract resolve<T extends any = any>(
    typeOrToken: any,
    ...args: any[]
  ): T;

  /**
   * If the injector stores instances
   * of a type this method can be
   * used to get resolved bindings
   * from this injector or its
   * parents
   */
  public abstract get?<T extends any = any, B extends any = any>(
    typeOrToken: Providable<T>
  ): ResolvedBinding<B, T>;
}
