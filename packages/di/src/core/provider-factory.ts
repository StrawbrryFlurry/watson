import { AbstractInjectableFactory } from '@di/core/abstract-factory';
import { Binding } from '@di/core/binding';
import { Injector } from '@di/core/injector';
import { Reflector } from '@di/core/reflector';
import { Injectable } from '@di/decorators/injectable.decorator';
import { getUnsafeInjectableDef } from '@di/providers/injectable-def';
import {
  DEFAULT_LIFETIME,
  DEFAULT_SCOPE,
  InjectableDef,
  InjectableOptions,
  InjectorLifetime,
  ɵdefineInjectable,
} from '@di/providers/injection-token';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

/**
 * Same concept as `ComponentFactory` but
 * instead of creating known components
 * registered in the Application, you can
 * use this factory to create `unknown` or
 * yet unregistered / unknown providers.
 *
 * Beware that singleton providers are not
 * made globally available as they could
 * possibly overwrite existing module
 * provided singletons.
 *
 * Providers can only depend on known
 * module dependencies.
 */
@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class ProviderFactoryRef<
  T extends Type
> extends AbstractInjectableFactory<T> {}

export class ProviderFactory<
  T extends Type = Type
> extends ProviderFactoryRef<T> {
  constructor(
    type: T,
    injector: Injector,
    injectableOptions?: InjectableOptions
  ) {
    super(type, injector);
    let injectableDef: InjectableDef;

    if (!isNil(injectableOptions)) {
      injectableDef = ɵdefineInjectable(this.type, injectableOptions);
    } else {
      injectableDef =
        getUnsafeInjectableDef(this.type) ??
        <InjectableDef>{
          lifetime: DEFAULT_LIFETIME,
          providedIn: DEFAULT_SCOPE,
        };
    }

    const { lifetime, providedIn } = injectableDef;
    const deps = Reflector.reflectCtorArgs(this.type);

    const binding = new Binding<T, any, T>(this.type, lifetime, providedIn);
    binding.deps = deps;
    binding.factory = (...args: any[]) => Reflect.construct(this.type, args);

    this.bindingRef = binding;
  }
}
