import { UniqueTypeArray } from '@di/data-structures';
import { W_GLOBAL_PROV } from '@di/fields';
import { InjectableOptions, InjectionToken, InjectorLifetime, ɵdefineInjectable } from '@di/providers';

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

interface InjectableDecoratorWithGlobalInjectablesProperty {
  [W_GLOBAL_PROV]: UniqueTypeArray<InjectableOptions>;
}

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return (target: Object) => {
    const { lifetime, providedIn } = options;
    const injectableDef = ɵdefineInjectable(target, providedIn, lifetime);

    if (injectableDef.providedIn === "root") {
      <InjectableDecoratorWithGlobalInjectablesProperty>(
        Injectable[W_GLOBAL_PROV].push(target)
      );
    }
  };
}

(<InjectableDecoratorWithGlobalInjectablesProperty>(<any>Injectable))[
  W_GLOBAL_PROV
] = new UniqueTypeArray();

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
