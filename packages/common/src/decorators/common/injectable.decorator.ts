import { INJECTABLE_METADATA } from '@common/constants';
import { InjectableOptions, InjectionToken, InjectorLifetime, ProvidedInScope } from '@common/di/injection-token';
import { mergeDefaults } from '@common/utils';

export interface InjectableMetadata extends Required<InjectableOptions> {}

export const DEFAULT_LIFETIME = InjectorLifetime.Singleton;
export const DEFAULT_SCOPE: ProvidedInScope = "root";

/**
 * TODO: Evaluate if this is useful - if so figure
 * out how to bind this in the `ModuleRef` constructor
 * as Injector.get is async.
 */
export const CUSTOM_INJECTABLE_METADATA = new InjectionToken<string>(
  "The metadata key that Watson should pick up from custom injectables.",
  {
    lifetime: InjectorLifetime.Singleton,
    providedIn: "module",
  }
);

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
