import { Binding, ModuleInjector, Reflector } from '@di';
import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  getOwnDefinition,
  InjectionToken,
  InjectorElementId,
  InjectorScope,
  isNil,
  Providable,
  Type,
  UseExistingProvider,
  ValueProvider,
  WATSON_BINDING_DEF,
  WATSON_ELEMENT_ID,
} from '@watsonjs/common';

import { ApplicationRef } from '..';
import { NullInjector } from './null-injector';

export type ProviderResolvable<T = any> = CustomProvider<T> | Type<T>;

export const INJECTOR = new InjectionToken(
  "The current module injector for a given module.",
  InjectorElementId.Injector
);

export const ROOT_INJECTOR = new InjectionToken(
  "The application root injector",
  InjectorElementId.Root
);

export abstract class Injector {
  public static NULL = new NullInjector();

  public parent: Injector | null = null;

  public abstract get<T>(typeOrToken: Providable<T>): T;

  static create(
    providers: ProviderResolvable[],
    parent: Injector | NullInjector | null = null
  ) {
    return new ModuleInjector();
  }

  static [WATSON_ELEMENT_ID] = InjectorElementId.Injector;
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

export function createResolvedBinding(provider: ValueProvider): Binding {
  const { provide, useValue, multi, scope } = provider;
  const binding = new Binding(provide, scope ?? InjectorScope.Singleton);
  binding.ɵmetatype = provider;
  binding.ɵfactory = () => useValue;
  binding.multi = multi ?? false;

  return binding;
}

export function getProviderType(
  provider: ProviderResolvable
): Type | InjectionToken {
  if (isCustomProvider(provider)) {
    return provider.provide;
  }

  return provider;
}

export function getRootInjector(injector: Injector) {
  const { rootInjector } = injector.get(ApplicationRef);
  return rootInjector;
}

export function createBinding(provider: ProviderResolvable): Binding {
  const providerType = getProviderType(provider);
  const existingBinding = getOwnDefinition<Binding>(
    providerType,
    WATSON_BINDING_DEF
  );

  if (!isNil(existingBinding)) {
    return existingBinding;
  }

  const providerScope = Reflector.reflectProviderScope(provider);

  if (!isCustomProvider(provider)) {
    const binding = new Binding(provider, providerScope);
    binding.ɵmetatype = provider;
    binding.ɵfactory = (...args) => Reflect.construct(provider as Type, args);
    provider[WATSON_BINDING_DEF] = binding;
    return binding;
  }

  const { provide } = provider;
  const binding = new Binding(provide, providerScope);
  provide[WATSON_BINDING_DEF] = binding;
  /**
   * UseExisting providers are handled
   * by the injector itself as they
   * point to a different binding.
   */
  if (isClassProvider(provider)) {
    const { useClass, deps } = provider;
    binding.ɵmetatype = useClass;
    binding.ɵdeps = deps;
    binding.ɵfactory = (...args) => Reflect.construct(useClass, args);
  } else if (isFactoryProvider(provider)) {
    const { useFactory, deps } = provider;
    binding.ɵmetatype = useFactory;
    binding.ɵdeps = deps;
    binding.ɵfactory = (...args) => useFactory(...args);
  } else {
    const { useValue } = provider as ValueProvider;
    binding.ɵmetatype = useValue;
    binding.ɵfactory = () => useValue;
  }

  return binding;
}
