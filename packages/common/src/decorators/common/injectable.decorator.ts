import { INJECTABLE_METADATA } from '@constants';
import { mergeDefaults } from '@utils';

export enum InjectorScope {
  /**
   * Instantiated during bootstrapping, shared among
   * all modules that import the same exporting module.
   * @default
   */
  Singleton = 1 << 0,
  /**
   * Creates a new instance for every
   * module scope.
   */
  Scoped = 1 << 1,
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

export interface InjectableOptions {
  scope?: InjectorScope;
}

export interface InjectableMetadata extends Required<InjectableOptions> {}

const DEFAULT_SCOPE = InjectorScope.Singleton;

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  const metadata = mergeDefaults(options, {
    scope: DEFAULT_SCOPE,
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
