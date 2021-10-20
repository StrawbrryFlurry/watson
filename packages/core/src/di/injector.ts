import { Binding, DynamicInjector, Reflector } from '@di';
import {
  ClassProvider,
  CustomProvider,
  DEFAULT_LIFETIME,
  DEFAULT_SCOPE,
  DIProvided,
  FactoryProvider,
  getOwnDefinition,
  INJECTABLE_METADATA,
  InjectableOptions,
  InjectionToken,
  InjectorLifetime,
  isNil,
  Providable,
  ProvidedInScope,
  Type,
  UseExistingProvider,
  ValueProvider,
  W_BINDING_DEF,
  W_PROV_LIFETIME,
  W_PROV_SCOPE,
} from '@watsonjs/common';

import { ApplicationRef } from '..';
import { NullInjector } from './null-injector';

export type ProviderResolvable<T = any> = CustomProvider<T> | Type<T>;

export const INJECTOR = new InjectionToken<Injector>(
  "The current module injector for a given module.",
  {
    providedIn: "module",
  }
);

export const ROOT_INJECTOR = new InjectionToken<Injector>(
  "The application root injector"
);

export type InjectorGetResult<T> = T extends InjectionToken<infer R>
  ? R
  : T extends new (...args: any[]) => infer R
  ? R
  : never;

/**
 * If it's okay for the injector to
 * not find a specific token, provide
 * this constant as the default value.
 * That way, if no provider is found,
 * it is returned by the `NullInjector`
 */
export const NOT_FOUND = {};

export abstract class Injector extends DIProvided({ providedIn: "module" }) {
  public static NULL = new NullInjector();

  public parent: Injector | null = null;

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R>;

  static create(
    providers: ProviderResolvable[],
    parent: Injector | null = null,
    scope: any | null = null,
    component: boolean = false
  ) {
    return new DynamicInjector(providers, parent, scope, component);
  }
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
  const { provide, useValue, multi } = provider;

  const { lifetime, providedIn } = getProviderScope(provider);

  const binding = new Binding(provide, lifetime, providedIn, () => useValue);

  binding.metatype = provider;
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

export async function getRootInjector(injector: Injector) {
  const { rootInjector } = await injector.get(ApplicationRef);
  return rootInjector;
}

export function getProviderScope(
  typeOrProvider: ProviderResolvable
): Required<InjectableOptions> {
  let lifetime: InjectorLifetime | undefined;
  let scope: ProvidedInScope | undefined;

  if (isCustomProvider(typeOrProvider)) {
    const { provide } = typeOrProvider;

    scope = provide[W_PROV_LIFETIME];
    lifetime = provide[W_PROV_SCOPE];
  } else {
    const metadata = Reflector.reflectMetadata<InjectableOptions>(
      INJECTABLE_METADATA,
      typeOrProvider
    );

    lifetime = typeOrProvider[W_PROV_LIFETIME] ?? metadata?.lifetime;
    scope = typeOrProvider[W_PROV_SCOPE] ?? metadata?.providedIn;
  }

  lifetime ??= DEFAULT_LIFETIME;
  scope ??= DEFAULT_SCOPE;

  return {
    lifetime,
    providedIn: scope,
  } as Required<InjectableOptions>;
}

export function createBinding(provider: ProviderResolvable): Binding {
  const providerType = getProviderType(provider);
  const existingBinding = getOwnDefinition<Binding>(
    providerType,
    W_BINDING_DEF
  );

  if (!isNil(existingBinding)) {
    return existingBinding;
  }

  const { lifetime, providedIn } = getProviderScope(provider);

  if (!isCustomProvider(provider)) {
    const deps = Reflector.reflectCtorArgs(provider);

    const binding = new Binding(provider, lifetime, providedIn);
    binding.metatype = provider;
    binding.deps = deps;
    binding.factory = (...args) => Reflect.construct(provider as Type, args);
    provider[W_BINDING_DEF] = binding;
    return binding;
  }

  const { provide, multi } = provider;
  const binding = new Binding(provide, lifetime, providedIn);
  provide[W_BINDING_DEF] = binding;
  binding.multi = multi ?? false;
  /**
   * UseExisting providers are handled
   * by the injector itself as they
   * point to a different binding.
   */
  if (isClassProvider(provider)) {
    const { useClass, deps } = provider;
    binding.metatype = useClass;
    binding.deps = deps;
    binding.factory = (...args) => Reflect.construct(useClass, args);
  } else if (isFactoryProvider(provider)) {
    const { useFactory, deps } = provider;
    binding.metatype = useFactory;
    binding.deps = deps;
    binding.factory = (...args) => useFactory(...args);
  } else {
    const { useValue } = provider as ValueProvider;
    binding.metatype = useValue;
    binding.factory = () => useValue;
  }

  return binding;
}
