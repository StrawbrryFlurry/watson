import { INJECTABLE_METADATA } from '@constants';
import { Type } from '@interfaces';
import { mergeDefaults } from '@utils';

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
  | "ctx"
  | Type;

export interface InjectableOptions {
  /** {@link InjectorLifetime} */
  lifetime?: InjectorLifetime;
  /** {@link ProvidedInScope} */
  providedIn?: ProvidedInScope;
}

export interface InjectableMetadata extends Required<InjectableOptions> {}

export const DEFAULT_LIFETIME = InjectorLifetime.Singleton;
export const DEFAULT_SCOPE: ProvidedInScope = "root";

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  const metadata = mergeDefaults(options, {
    lifetime: DEFAULT_LIFETIME,
    providedIn: DEFAULT_SCOPE,
  });

  return (target: Object) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, metadata, target);
  };
}

/**
 * TODO:
 * Guild injectables are
 * scoped providers that
 * allow you to implement guild
 * specific features by having
 * access to data on the
 * execution context like the guildID.
 *
 * A guild injectable is cached in a
 * `Map<GuildId, InjectableWrapper>`
 * so that it doesn't have to be
 * re-created on every request.
 */
export function GuildInjectable() {}
