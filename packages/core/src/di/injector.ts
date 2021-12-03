import { Binding, DynamicInjector, Reflector } from '@core/di';
import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  HasProv,
  Injectable,
  InjectableOptions,
  InjectionToken,
  InjectorLifetime,
  isNil,
  Providable,
  resolveForwardRef,
  Type,
  UseExistingProvider,
  ValueProvider,
  W_BINDING_DEF,
  W_PROV,
  ɵdefineInjectable,
} from '@watsonjs/common';

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

export type InjectorGetResult<T, Multi = false> = T extends InjectionToken<
  infer R
>
  ? R
  : T extends new (...args: any[]) => infer R
  ? Multi extends false
    ? R
    : R[]
  : T extends abstract new (...args: any[]) => any
  ? Multi extends false
    ? InstanceType<T>
    : InstanceType<T>[]
  : never;

/**
 * If it's okay for the injector to
 * not find a specific token, provide
 * this constant as the default value.
 * That way, if no provider is found,
 * it is returned by the `NullInjector`
 */
export const NOT_FOUND = {};

@Injectable({ providedIn: "module" })
export abstract class Injector {
  public static NULL = new NullInjector();

  public parent: Injector | null = null;

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector | null
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
  const { lifetime, providedIn } = getInjectableDef(provider);

  const binding = new Binding(provide, lifetime, providedIn, () => useValue);

  binding.metatype = provider;
  binding.multi = multi ?? false;

  return binding;
}

export function getProviderToken(
  provider: ProviderResolvable
): Type | InjectionToken {
  if (isCustomProvider(provider)) {
    return resolveForwardRef(provider.provide);
  }

  return resolveForwardRef(provider);
}

export function getInjectableDef(
  typeOrProvider: ProviderResolvable | Providable
): Required<InjectableOptions> {
  if (isNil(typeOrProvider)) {
    throw "Can't get injectable definition of null or undefined";
  }

  let typeOrToken: Type | InjectionToken = typeOrProvider as Type;

  if (isCustomProvider(typeOrProvider)) {
    const { provide } = typeOrProvider;
    typeOrToken = provide;
  }

  let injectableDef = (<HasProv>(<any>typeOrToken))[W_PROV];

  if (isNil(injectableDef)) {
    injectableDef = ɵdefineInjectable(typeOrToken);
  }

  return injectableDef;
}

export function createBinding(provider: ProviderResolvable): Binding {
  const { lifetime, providedIn } = getInjectableDef(provider);
  const token = getProviderToken(provider);

  /**
   * For singleton providers we use the binding saved on
   * the provider type such that we always use the same
   * instance even throughout different injectors
   */
  const isSingletonProvider = lifetime & InjectorLifetime.Singleton;

  if (isSingletonProvider && !isNil(token[W_BINDING_DEF])) {
    return token[W_BINDING_DEF];
  }

  if (!isCustomProvider(provider)) {
    const deps = Reflector.reflectCtorArgs(provider);

    const binding = new Binding(provider, lifetime, providedIn);
    binding.metatype = provider;
    binding.deps = deps;
    binding.factory = (...args) => Reflect.construct(provider as Type, args);
    token[W_BINDING_DEF] = binding;
    return binding;
  }

  const { multi } = provider;

  const binding = new Binding(token, lifetime, providedIn);
  token[W_BINDING_DEF] = binding;
  binding.multi = multi ?? false;
  /**
   * UseExisting providers are handled
   * by the injector itself as they
   * point to a different binding.
   */
  if (isClassProvider(provider)) {
    const { useClass, deps } = provider;
    binding.metatype = useClass;
    binding.deps = deps ?? null;
    binding.factory = (...deps) => Reflect.construct(useClass, deps);
  } else if (isFactoryProvider(provider)) {
    const { useFactory, deps } = provider;
    binding.metatype = useFactory;
    binding.deps = deps ?? null;
    binding.factory = (...deps) => useFactory(...deps);
  } else {
    const { useValue } = provider as ValueProvider;
    binding.metatype = useValue;
    binding.factory = () => useValue;
  }

  return binding;
}
