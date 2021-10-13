import {
  InjectorGetResult,
  isCustomProvider,
  isUseExistingProvider,
  ModuleRef,
} from "@di";
import { resolveAsyncValue } from "@utils";
import {
  InjectorLifetime,
  isNil,
  Providable,
  ProvidedInScope,
  Type,
  ValueProvider,
  W_PROV_SCOPE,
} from "@watsonjs/common";

import {
  createBinding,
  INJECTOR,
  InjectorBloomFilter,
  ProviderResolvable,
} from "..";
import { Binding } from "./binding";
import { Injector } from "./injector";

export class DynamicInjector implements Injector {
  public parent: Injector | null;
  protected _bloom: InjectorBloomFilter;

  protected readonly _records: Map<Providable, Binding>;

  protected _scope: Type | null;

  constructor(
    providers: ProviderResolvable[],
    parent: Injector | null = null,
    scope: Type | null = null
  ) {
    this._records = new Map<Providable, Binding>();
    this.parent = parent;
    this._scope = scope;

    if (scope) {
      this._records.set(
        ModuleRef,
        createBinding({
          provide: ModuleRef,
          useValue: scope,
        } as ValueProvider)
      );
    }

    this._records.set(
      Injector,
      createBinding({
        provide: Injector,
        useValue: this,
      } as ValueProvider)
    );

    this._records.set(
      INJECTOR,
      createBinding({
        provide: INJECTOR,
        useValue: this,
      } as ValueProvider)
    );

    this._bindProviders(providers);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): Promise<R> {
    const bindingScope = typeOrToken[W_PROV_SCOPE] as ProvidedInScope;
    let parent = this.parent ?? Injector.NULL;

    if (
      !isNil(this._scope) &&
      (bindingScope === "module" ||
        this._scope instanceof (bindingScope as Type))
    ) {
      parent = Injector.NULL;
    }

    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return parent.get(typeOrToken);
    }

    const { lifetime, instance, ɵdeps } = binding;

    if (!isNil(instance) && binding.isDependencyTreeStatic()) {
      return instance;
    }

    if (!binding.hasDependencies()) {
      const instance = binding.ɵfactory();

      if (lifetime & InjectorLifetime.Singleton) {
        binding.instance = instance;
      }

      return instance;
    }

    const dependencies = [];

    for (let i = 0; i < (ɵdeps as unknown[]).length; i++) {
      const dep = ɵdeps[i];

      const depInstance = this._resolveDependency(dep);
      dependencies.push(depInstance);
    }

    const _instance = await resolveAsyncValue(
      binding.ɵfactory(...dependencies)
    );

    if (lifetime & InjectorLifetime.Singleton) {
      binding.instance = _instance;
    }

    return _instance;
  }

  public bind<T extends ProviderResolvable[]>(...providers: T): void {
    this._bindProviders(providers);
  }

  private _bindProviders(providers: ProviderResolvable[]) {
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];

      if (isCustomProvider(provider)) {
        if (isUseExistingProvider(provider)) {
          const { provide, useExisting, multi } = provider;
          // TODO: Bind UseExisting
        }
      }

      const binding = createBinding(provider);
      this._records.set(binding.token, binding);
    }
  }

  private _resolveDependency(dep: Providable) {}

  /**
   * Resolves dependencies for a given
   * provider.
   */
  // public resolveTypeDeps(binding: Binding): ResolvedBinding {
  //   new Binding();
  //
  //   new ResolvedBinding();
  // }

  // private _recursivelyAddProviders(providers) {}
}

// public resolve<T extends any>(
//   typeTokenOrProvider: ProviderResolvable | Providable
// ): T {
//  if (isInjectionToken(typeTokenOrProvider)) {
//    const hash = this._bloom.getHash(typeTokenOrProvider);
//
//    if (isNil(hash) || this._bloom.has(hash)) {
//      if (isNil(this._parent)) {
//        throw new UnknownProviderException(
//          "ReflectiveInjector",
//          typeTokenOrProvider.name,
//          this._moduleRef.name
//        );
//      }
//
//      return this._parent.resolve(typeTokenOrProvider);
//    }
//  }
//
//  const token = getTokenFromProvider(typeTokenOrProvider);
//
//  let binding = this._providers.get(token);
//
//  if (isNil(binding)) {
//    createBindingFromProvider(typeTokenOrProvider, this._moduleRef);
//
//    binding = new Binding();
//  }
//
//  const binding = new Binding();
//
//  return null as T;

function createInstanceOfBinding<
  T extends Binding,
  R extends T extends Binding<infer T, infer F, infer I> ? I : never
>(binding: T): R {
  return binding.instance as R;
}

function resolveProviderDependencies() {}
