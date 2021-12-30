import { UniqueTypeArray } from '@di/data-structures';
import { W_GLOBAL_PROV } from '@di/fields';
import { InjectableOptions, InjectionToken, InjectorLifetime, ɵdefineInjectable } from '@di/providers/injection-token';
import { isNil } from '@di/utils/common';

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

/**
 * Marks any provider as an injectable which
 * allows you to specify additional behavior
 * for that injectable within the application.
 *
 * If you don't specify anything, the framework
 * will provide the injectable as a singleton in
 * the root module. Note that you'll have to
 * manually add it into a module for it to be
 * registered in the application.
 *
 * Providing an object without any additional
 * configuration or using `{ providedIn: "root" }`
 * will add the injectable to the root module injector
 * automatically.
 *
 * See {@link InjectableOptions} for more information.
 */
export function Injectable(options?: InjectableOptions): ClassDecorator {
  return (target: Object) => {
    if (isNil(options)) {
      return;
    }

    const injectableDef = ɵdefineInjectable(target, options);

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
