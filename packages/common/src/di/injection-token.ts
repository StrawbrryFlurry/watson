import { Type } from '@common/interfaces';

import { HasProv, W_PROV } from '..';
import { resolveForwardRef } from './forward-ref';

const INJECTION_TOKE_PREFIX = "InjectionToken";

export type Providable<T = any> = InjectionToken<T> | Type<T>;

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
 * - `external` Makes the provider available
 * in the external injector which is used
 * by plugins or modules like the nest adapter
 * that connects the Nest DI system to Watson.
 *
 * - `Module` Restricts the provider to the module
 * defined in `providedIn` and modules that import
 * that module, given it is exported.
 *
 * - `Router` Watson will try to resolve the provider
 * at in the router's injection scope. If it's
 * not found we'll try to resolve it as a
 * module scoped provider.
 *
 * - `Context` Provides the injectable in the
 * `ContextInjector`. Note that injectables with
 * a lifespan of `Event` need to be provided in
 * the `ContextInjector`.
 *
 * @default `root`
 */
export type ProvidedInScope =
  | "root"
  | "internal"
  | "external"
  | "module"
  | "router"
  | "ctx"
  | Type;

export interface InjectableOptions {
  /** {@link InjectorLifetime} */
  lifetime?: InjectorLifetime;
  /** {@link ProvidedInScope} */
  providedIn?: ProvidedInScope;
}

export const DEFAULT_LIFETIME = InjectorLifetime.Singleton;
export const DEFAULT_SCOPE: ProvidedInScope = "root";

export function isInjectionToken(obj: any): obj is InjectionToken {
  return obj instanceof InjectionToken;
}

export class InjectionToken<T /* The value that this token provides */ = any> {
  public readonly name: string;

  constructor(
    private readonly _description: string,
    options: InjectableOptions = {}
  ) {
    this.name = `[${INJECTION_TOKE_PREFIX}] ${this._description}`;
    const { lifetime, providedIn } = options;
    ɵdefineInjectable(this, providedIn, lifetime);
  }
}

export function ɵdefineInjectable(
  typeOrToken: Object | Type | InjectionToken,
  providedIn: ProvidedInScope = DEFAULT_SCOPE,
  lifetime: InjectorLifetime = DEFAULT_LIFETIME
): HasProv["ɵprov"] {
  const injectableDef = {
    providedIn: resolveForwardRef(providedIn),
    lifetime: lifetime,
  };

  typeOrToken[W_PROV] = injectableDef;
  return injectableDef;
}
