import { Binding, FactoryFn, Module, NewableTo } from '@di';
import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  InjectorLifetime,
  Providable,
  Type,
  UseExistingProvider,
  ValueProvider,
} from '@watsonjs/common';

import { ResolvedBinding } from './binding';

export type ProviderResolvable = CustomProvider | Type;

export abstract class Injector {
  public readonly parent: Injector | null;

  constructor(parent?: Injector) {
    this.parent = parent ?? null;
  }

  /**
   * Resolves`typeOrToken` using
   * tokens provided by itself or
   * the parent injector
   * given there is one.
   */
  public abstract resolve(typeOrToken: any, ...args: any[]): any;

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
}

export function getTokenFromProvider(provider: ProviderResolvable): Providable {
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

export function createBindingFromProvider(
  provider: ProviderResolvable,
  module: Module | null,
  lifetime: InjectorLifetime
): Binding {
  if (!isCustomProvider(provider)) {
    const binding = new Binding(provider, provider, module, lifetime);

    binding.ɵfactory = (...args) => Reflect.construct(provider as Type, args);
    return binding;
  }

  const { provide, lifetime: _lifetime } = provider;
  const binding = new Binding(null as any, provide, module, _lifetime!);
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
