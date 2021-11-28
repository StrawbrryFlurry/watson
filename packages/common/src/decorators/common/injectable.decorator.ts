import { InjectableOptions, InjectionToken, InjectorLifetime, ɵdefineInjectable } from '@common/di/injection-token';

export interface InjectableMetadata extends Required<InjectableOptions> {}

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
  return (target: Object) => {
    const { lifetime, providedIn } = options;
    ɵdefineInjectable(target, providedIn, lifetime);
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
