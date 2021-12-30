import { InjectorInquirerContext } from '@di/core/inquirer-context';
import { Reflector } from '@di/core/reflector';
import { W_BINDING_DEF } from '@di/fields';
import { BeforeResolution } from '@di/hooks';
import { isClassProvider, isCustomProvider, isFactoryProvider } from '@di/providers/custom-provider';
import { ValueProvider } from '@di/providers/custom-provider.interface';
import { resolveForwardRef } from '@di/providers/forward-ref';
import { getInjectableDef, getProviderToken } from '@di/providers/injectable-def';
import { InjectorLifetime, Providable, ProvidedInScope } from '@di/providers/injection-token';
import { Type } from '@di/types';
import { resolveAsyncValue } from '@di/utils';
import { isEmpty, isFunction, isNil } from '@di/utils/common';
import { Observable } from 'rxjs';

import type {
  Injector,
  InjectorGetResult,
  ProviderResolvable,
} from "./injector";

export type NewableTo<T = any, D extends Array<any> = any[]> = new (
  ...args: D
) => T;
export type FactoryFn<T = any, D extends Array<any> = any[]> = (
  ...args: D
) => T;
export type FactoryFnWithoutDeps<T = any> = () => T;

const SINGLETON_BINDING_CONTEXT: Injector = <any>{};

/**
 * A binding represents a provider
 * in an injector context.
 *
 * The `Binding` wrapper for a provider
 * stores additional information about the
 * binding which can be reused if a module
 * provider is used in another injector
 * context.
 */
export class Binding<
  Token extends Providable = any,
  Deps extends Providable[] = any[],
  InstanceType extends any = InjectorGetResult<Token>,
  Factory extends (...deps: Deps) => InstanceType = any
> {
  /** The type this binding represents */
  public metatype: ProviderResolvable;

  /** The token with which the binding can be resolved */
  public readonly token: Providable;

  public get name() {
    return this.token.name;
  }

  /**
   * If the binding has any dependencies,
   * this property contains all the tokens
   * that should be injected as an argument
   * to resolve the factory function.
   *
   * [SomeService, SomeContextProperty]
   */
  public deps: Deps | null;

  public multi: boolean = false;

  /**
   * Whether the binding has any dependencies
   * that will cause the instance to get
   * different instances depending on when or
   * by whom the dependency is created.
   */
  private _isTreeStatic: boolean | null = null;
  /**
   * Whether the binding was made a transient
   * provider by any of it's dependencies.
   */
  private _isTransientByDependency: boolean | null = null;

  /**
   * Keeps track of all instances that were created
   * for this binding.
   *
   * @key The context injector with which
   * the instance was created
   * @value The instance
   */
  private _instances = new WeakMap<
    Injector,
    InstanceType | InstanceType[] | null
  >();

  /** {@link  InjectorLifetime} */
  public readonly lifetime: InjectorLifetime;
  /** {@link ProvidedInScope} */
  public readonly scope: ProvidedInScope;

  constructor(
    token: Token,
    lifetime: InjectorLifetime,
    scope: ProvidedInScope,
    factory?: Factory
  ) {
    this.token = token;
    this.lifetime = lifetime;
    this.scope = scope;

    this.factory = factory! ?? undefined;
  }

  public isTransient(): boolean {
    return (
      !!(this.lifetime & InjectorLifetime.Transient) ||
      this.isTransientByDependency()
    );
  }

  public isTransientByDependency(): boolean {
    if (!isNil(this._isTransientByDependency)) {
      return this._isTransientByDependency;
    }

    const lifetime = findMostTransientDependencyLifetime(this.deps ?? []);

    if (lifetime & InjectorLifetime.Transient) {
      return (this._isTransientByDependency = true);
    }

    return (this._isTransientByDependency = false);
  }

  /**
   * Checks the internal instance cache using
   * the context injector provided or the singleton
   * key.
   */
  public getInstance(
    ctx?: Injector | null
  ): InstanceType | InstanceType[] | null {
    ctx ??= SINGLETON_BINDING_CONTEXT;
    return this._instances.get(ctx) ?? null;
  }

  /**
   * Caches the instance in the binding
   * for the context injector provided.
   */
  public setInstance(instance: InstanceType, ctx?: Injector | null): void {
    // Handle `null` case.
    ctx ??= SINGLETON_BINDING_CONTEXT;
    this._instances.set(ctx, instance);
  }

  /**
   * Whether the binding has any
   * dependencies that might change
   * depending on the context the
   * binding is created in.
   */
  public isDependencyTreeStatic(): boolean {
    if (!isNil(this._isTreeStatic)) {
      return this._isTreeStatic;
    }

    if (!this.hasDependencies()) {
      return (this._isTreeStatic = true);
    }

    const lifetime = findMostTransientDependencyLifetime(this.deps ?? []);
    const isTreeStatic = !(
      lifetime &
      (InjectorLifetime.Event | InjectorLifetime.Transient)
    );

    this._isTreeStatic = isTreeStatic;
    return isTreeStatic;
  }

  public hasStaticInstance(): boolean {
    return this.isDependencyTreeStatic() && !isNil(this.getInstance());
  }

  public hasDependencies(): boolean {
    return !isNil(this.deps) && !isEmpty(this.deps);
  }

  public callBeforeResolutionHook(
    injector: Injector,
    deps: Deps,
    inquirerContext: InjectorInquirerContext
  ): Deps | Promise<Deps> {
    if (isNil(this.beforeResolutionHook)) {
      return deps;
    }

    return resolveAsyncValue(
      this.beforeResolutionHook(injector, deps, inquirerContext)
    );
  }

  /**
   * Internal factory function that will
   * be called by the injector to create a
   * new instance of the provider.
   */
  public factory!: (
    ...deps: Deps
  ) => Observable<InstanceType> | Promise<InstanceType> | InstanceType;

  public beforeResolutionHook?: BeforeResolution<any>["beforeResolution"];
}

/**
 * Takes an array of provider dependencies and checks whether
 * constructing the provider with those dependencies will
 * ever yield different results depending on the context.
 */
export function findMostTransientDependencyLifetime(
  deps: Providable[]
): InjectorLifetime {
  let providerLifetime = InjectorLifetime.Singleton;

  for (let i = 0; i < deps!.length; i++) {
    const dep = deps![i];
    const { lifetime, providedIn } = getInjectableDef(dep);

    if (lifetime & InjectorLifetime.Transient) {
      /**
       * If a dependency is transient the
       * whole provider is automatically
       * marked transient as well.
       */
      return InjectorLifetime.Transient;
    }

    if (lifetime & InjectorLifetime.Event || providedIn === "ctx") {
      providerLifetime = InjectorLifetime.Event;
    }
  }

  return providerLifetime;
}

/**
 * Creates a `useValue` binding which
 * maps the provider token `provide` with
 * the resolved value in the value provider.
 */
export function createResolvedBinding(_provider: ValueProvider): Binding {
  const provider = resolveForwardRef(_provider);
  const { provide, useValue, multi } = provider;
  const { lifetime, providedIn } = getInjectableDef(provider);

  const binding = new Binding(provide, lifetime, providedIn, () => useValue);

  binding.metatype = provider;
  binding.multi = multi ?? false;

  return binding;
}

/**
 * Creates a new binding using `_provider`.
 * Resolves a forwardRef if there is one and
 * figures out the actual type from a custom
 * provider as well as it's providedIn scope
 * and lifetime.
 */
export function createBinding(_provider: ProviderResolvable): Binding {
  const provider = resolveForwardRef(_provider);
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

    const { beforeResolution } =
      (provider.prototype as BeforeResolution<any>) ?? {};

    if (isFunction(beforeResolution)) {
      binding.beforeResolutionHook = beforeResolution;
    }

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

    binding.metatype = provider;
    binding.deps = deps ?? Reflector.reflectCtorArgs(useClass) ?? null;
    binding.factory = (...deps) => Reflect.construct(useClass, deps);
  } else if (isFactoryProvider(provider)) {
    const { useFactory, deps } = provider;

    binding.metatype = provider;
    binding.deps = deps ?? null;
    binding.factory = (...deps) => useFactory(...deps);
  } else {
    const { useValue } = provider as ValueProvider;

    binding.metatype = provider;
    binding.factory = () => useValue;
  }

  return binding;
}
