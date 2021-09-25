import { Binding, FactoryFn, Module, NewableTo } from '@di';
import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  InjectorElementId,
  InjectorScope,
  Providable,
  Type,
  UseExistingProvider,
  ValueProvider,
  WATSON_ELEMENT_ID,
} from '@watsonjs/common';

import { ResolvedBinding } from './binding';
import { NullInjector } from './null-injector';

export type ProviderResolvable = CustomProvider | Type;

export abstract class Injector {
  public static NULL = new NullInjector();

  public parent: Injector | null = null;

  /**
   * If the injector stores instances
   * of a type this method can be
   * used to get resolved bindings
   * from this injector or its
   * parents
   */
  public abstract get?<
    T extends NewableTo<V> | FactoryFn<V> = any,
    D extends any[] = any,
    V extends any = any
  >(typeOrToken: Providable<T>): ResolvedBinding<T, D, V> | null;

  static [WATSON_ELEMENT_ID] = InjectorElementId.Injector;
}

export function getTokenFromProvider(provider: ProviderReso lvable): Providable {
  if (!isCustomProvider(provider)) {
    return provider;
  }

  return provider.provide;
}

export function isCustomProvider(provider: any): provider is CustomProvider {
  return provider && "provide" in provider;
}

export function isUseExistingProvider(
  provider: CustomProvider
): provider is UseExistingProvider {
  return provider && "useExisting" in provider;
}

export function isClassProvider(
  provider: CustomProvider
): provider is ClassProvider {
  return provider && "useClass" in provider;
}

export function isFactoryProvider(
  provider: CustomProvider
): provider is FactoryProvider {
  return provider && "useFactory" in provider;
}

export function isValueProvider(
  provider: CustomProvider
): provider is ValueProvider {
  return provider && "useValue" in provider;
}

export function createBinding<T>(
  token: Providable,
  scope: InjectorScope,
  factory: () => T
) {
  return new Binding(token, scope, factory);
}

export function createBindingFromProvider(
  provider: ProviderResolvable,
  module: Module | null,
  scope: InjectorScope
): Binding {
  if (!isCustomProvider(provider)) {
    const binding = new Binding(provider, provider, module, scope);

    binding.ɵfactory = (...args) => Reflect.construct(provider as Type, args);
    return binding;
  }

  const { provide, scope: _scope } = provider;
  const binding = new Binding(null as any, provide, module, _scope ?? scope);
  /**
   * UseExisting providers are handled
   * by the injector itself as they
   * point to a different binding.
   */
  if (isClassProvider(provider)) {
    const { useClass, inject } = provider;
    binding.ɵmetatype = useClass;
    binding.ɵinject = inject;
    binding.ɵfactory = (...args) => Reflect.construct(useClass, args);
  } else if (isFactoryProvider(provider)) {
    const { useFactory, inject } = provider;
    binding.ɵmetatype = useFactory;
    binding.ɵinject = inject;
    binding.ɵfactory = (...args) => useFactory(...args);
  } else {
    const { useValue } = provider as ValueProvider;
    binding.ɵmetatype = useValue;
    binding.ɵfactory = () => useValue;
  }

  return binding;
}
