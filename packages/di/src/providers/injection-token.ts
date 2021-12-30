import { W_PROV, ɵHasProv } from '@di/fields';
import { Type } from '@di/types';

import { resolveForwardRef } from './forward-ref';

const INJECTION_TOKE_PREFIX = "InjectionToken";

/**
 * A type that can be used to retrieve
 * provider instance from an Injector.
 */
export type Providable<T = any> = InjectionToken<T> | Type<T>;

/**
 * A set of different lifetimes
 * a provider can have in the application.
 *
 * The lifetime decides when a new instance
 * of a given provider is created and whether
 * it should be cached.
 */
export enum InjectorLifetime {
  /**
   * Instantiated during bootstrapping, shared among
   * all modules that import the same exporting module.
   * @default
   */
  Singleton = 1 << 0,
  /**
   * Creates a new instance
   * every time the provider is
   * requested
   */
  Transient = 1 << 2,
  /**
   * Creates a provider instance
   * every time a new event is emitted.
   *
   * Note that you're required to use
   * this provider scope if you're trying
   * to access other provider that also
   * provide an event scoped instance.
   */
  Event = 1 << 3,
  /**
   * Creates a provider instance every
   * module injector. A `ComponentRef` that
   * is used for provider resolution is also
   * treated as its own module.
   */
  Scoped = 1 << 4,
}

/**
 * The injector scope in which
 * a given dependency is provided in.
 *
 * - `root` Provides the provider in the
 * root injector which means it's accessible
 * by all other modules, plugins and elements
 * of Watson.
 *
 * - `internal` Makes the provider available
 * in the main `AppModule` injector which
 * makes them resolvable by internal modules
 * but not by plugins or external modules.
 *
 * - `module` Restricts the provider to the module
 * defined in `providedIn` and modules that import
 * that module, given it is exported.
 *
 * - `component` If a provider with this scope
 * is added as a provider to the module it's
 * skipped in the module provider resolution
 * and instead added to all of the module's
 * components. Component scoped dependencies
 * also allow the injector to use a parent
 * injector for it's resolution and will,
 * unlike the `module` scope not throw an
 * `NullInjectorError` if the provider
 * was not found within the current injector.
 *
 * - `ctx` Provides the injectable in a special
 * `ContextInjector`. Such injector is not provided
 * by the DI framework but by implementations of it
 * like @watson/core. The `ContextInjector` that
 * should provide these context dependencies
 * can be provided when calling `Injector.get`.
 *
 * - `external | Type` Makes the provider available
 * in the external injector which is used
 * by plugins or modules like the nest adapter
 * that connects the Nest DI system to Watson.
 * To specify the target external injector specify
 * that framework's injector as the value.
 * See - {@link CrossPlatformInjector}
 *
 * @default `root`
 */
export type ProvidedInScope =
  | "root"
  | "internal"
  | "module"
  | "component"
  | "ctx"
  | Type;

export interface InjectableOptions {
  /** {@link ProvidedInScope} */
  providedIn?: ProvidedInScope;
  /** {@link InjectorLifetime} */
  lifetime?: InjectorLifetime;
}

export interface InjectableDef extends Required<InjectableOptions> {}

export const DEFAULT_LIFETIME = InjectorLifetime.Singleton;
export const DEFAULT_SCOPE: ProvidedInScope = "root";

export function isInjectionToken(obj: any): obj is InjectionToken {
  return obj instanceof InjectionToken;
}

/**
 * Creates an injection token that can
 * be used in `CustomProviders` to declare
 * their provider scope and lifetime.
 */
export class InjectionToken<T /* The value that this token provides */ = any> {
  public readonly name: string;

  constructor(
    private readonly _description: string,
    options: InjectableOptions = {}
  ) {
    this.name = `[${INJECTION_TOKE_PREFIX}] ${this._description}`;
    const { lifetime, providedIn } = options;
    ɵdefineInjectable(this, { providedIn, lifetime });
  }
}

/**
 * Defines the `W_PROV` property on a
 * type or `InjectionToken` using options
 * values if none are provided.
 */
export function ɵdefineInjectable(
  typeOrToken: Object | Type | InjectionToken,
  options: InjectableOptions = {}
): ɵHasProv[typeof W_PROV] {
  const { lifetime, providedIn } = options;

  const injectableDef = {
    providedIn: resolveForwardRef(providedIn) ?? DEFAULT_SCOPE,
    lifetime: lifetime ?? DEFAULT_LIFETIME,
  };

  typeOrToken[W_PROV] = injectableDef;
  return injectableDef;
}
