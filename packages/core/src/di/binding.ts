import { InjectableOptions, InjectorLifetime } from '@watsonjs/common';

import { Module } from '.';

export type NewableTo<T, D extends Array<any> = any[]> = new (...args: D) => T;
export type FactoryFn<T, D extends Array<any> = any[]> = (...args: D) => T;

/**
 * A binding represents a provider
 * in any given module context.
 *
 * The `Binding` wrapper for a provider
 * stores additional information about the
 * binding which can be reused if a module
 * provider is used in another injector
 * context (By exporting it from the module).
 */
export class Binding<
  T extends any | NewableTo<any> | FactoryFn<any, D> = any,
  V extends any = any,
  D extends any[] = any
> {
  /** The type this binding represents */
  public readonly metatype: T;
  /** The module this binding belongs to */
  public readonly host: Module;
  /**
   * If the binding is a factory, this property
   * contains all the properties that should
   * be injected as an argument to resolve
   * the factory function.
   */
  public readonly inject: D;
  /**
   * If the binding is not transient
   * it's resolved `instance` is stored in this
   * property.
   */
  public instance: ResolvedBinding | null;
  /**
   *  The lifetime of this binding and
   *  all resolved values that it creates.
   */
  public readonly lifetime: InjectorLifetime;
  /** Resolved dependencies for this type */
  public readonly dependencies: Binding[];

  constructor(metatype: T, host: Module, options: InjectableOptions) {
    const { lifetime } = options;
    this.lifetime = lifetime!;
    this.metatype = metatype;
    this.host = host;
  }

  // private _injector = new StaticInjector();

  // /**
  //  * A factory function that can be
  //  * called to create this instance
  //  */
  // public async factory(): Promise<ResolvedBinding> {
  //   const resolvedDeps = [];

  //   for (let i = 0; i < this.dependencies.length; i++) {
  //     const dep = this.dependencies[i];
  //     const binding = await dep.factory();
  //     resolvedDeps.push(binding.instance);
  //   }

  //   const instance = this._injector.resolve(this.metatype, resolvedDeps);
  //   return new ResolvedBinding(this, instance);
  // }
}

/**
 * A resolved instance of a
 * {@link Binding }. Depending on
 * the lifetime of a provider there
 * can be multiple resolved bindings
 * for a given `Binding`.
 *
 * The resolved binding stores
 * the value for a resolved binding
 * as well as information about
 * how it can be instantiated and what type
 * it's coming from
 */
export class ResolvedBinding<T = any, V = any> {
  /** The host binding */
  public readonly binding: Binding<T>;
  /** The value or instance of this binding */
  public readonly instance: V;
  /** The id of the module this binding was resolved in */
  public readonly scope: string;

  constructor(binding: Binding<T>, instance: V) {
    this.binding = binding;
    this.instance = instance;
  }
}
