import { INJECTABLE_METADATA } from '@constants';
import { mergeDefaults } from '@utils';

export enum InjectionScope {
  Singleton,
  Scoped,
  Transient,
}

export interface InjectableOptions {
  scope?: InjectionScope;
}

const DEFAULT_SCOPE = InjectionScope.Singleton;

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
