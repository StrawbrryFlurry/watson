import { Injector } from '@injector';
import { InjectableOptions, InjectorLifetime } from '@watsonjs/common';

export type NewableTo<T, D extends Array<any> = any[]> = new (...args: D) => T;
export type FactoryFn<T, D extends Array<any> = any[]> = (...args: D) => T;

export class Binding<
  T extends any | NewableTo<any> | FactoryFn<any, D> = any,
  D extends any[] = any
> {
  /** The type this binding represents */
  public readonly metatype: T;
  /** The injector that created this binding */
  public readonly host: Injector;
  /** Resolved dependencies for this type */
  public readonly dependencies: D = [] as unknown as D;
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
  /**
   * If the binding can store a instance
   * value or if it's newly resolved each
   * time it is looked up by the injector.
   */
  public readonly isTransient: boolean;

  constructor(metatype: T, host: Injector, options: InjectableOptions) {
    const { lifetime } = options;
    this.lifetime = lifetime!;
    this.isTransient = lifetime !== InjectorLifetime.Singleton;

    this.metatype = metatype;
    this.host = host;
  }
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
export class ResolvedBinding<T = any> {
  /** The host binding */
  binding: Binding<T>;
  /** The value or instance of this binding */
  instance: T;
  /**
   * A factory function that can be
   * called to create this instance
   */
  factory: NewableTo<T> | FactoryFn<T>;
}
