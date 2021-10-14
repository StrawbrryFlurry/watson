import { getProviderType, InjectorGetResult, isCustomProvider, isUseExistingProvider, ModuleRef } from '@di';
import { resolveAsyncValue } from '@utils';
import {
  InjectorLifetime,
  isFunction,
  isNil,
  Providable,
  ProvidedInScope,
  Type,
  ValueProvider,
  W_PROV_SCOPE,
} from '@watsonjs/common';

import { createBinding, INJECTOR, InjectorBloomFilter, ProviderResolvable } from '..';
import { Binding } from './binding';
import { Injector } from './injector';

export class DynamicInjector implements Injector {
  public parent: Injector | null;
  protected _bloom: InjectorBloomFilter;

  protected readonly _records: Map<Providable, Binding | Binding[]>;

  protected _scope: Type | null;
  protected _component: boolean;

  constructor(
    providers: ProviderResolvable[],
    parent: Injector | null = null,
    scope: Type | null = null,
    /**
     * A component injector doesn't have it's own scoping
     * so it always resolves unknown providers in the parent
     * scope even if the binding scope is `module`.
     */
    component: boolean = false
  ) {
    this._records = new Map<Providable, Binding | Binding[]>();
    this.parent = parent;
    this._scope = scope;
    this._component = component;

    if (scope) {
      this._records.set(
        ModuleRef,
        createBinding({
          provide: ModuleRef,
          useValue: scope,
        } as ValueProvider)
      );

      this._records.set(scope, createBinding(scope));
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

  public bind<T extends ProviderResolvable[]>(...providers: T): void {
    this._bindProviders(providers);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any
  ): Promise<R> {
    const bindingScope = typeOrToken[W_PROV_SCOPE] as ProvidedInScope;
    let parent = this.parent ?? Injector.NULL;

    if (bindingScope === "ctx") {
      throw new Error(
        "[DynamicInjector] Cannot resolve a context bound provider in the dynamic injector"
      );
    }

    if (
      !this._component &&
      !isNil(this._scope) &&
      (bindingScope === "module" ||
        (isFunction(bindingScope) && this._scope instanceof bindingScope))
    ) {
      parent = Injector.NULL;
    }

    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return parent.get(typeOrToken, notFoundValue);
    }

    if (Array.isArray(binding)) {
      let instances = [];

      for (let i = 0; i < binding.length; i++) {
        const instance = await this._createInstanceWithDependencies(binding[i]);
        instances.push(instance);
      }

      return instances as R;
    }

    const instance = await this._createInstanceWithDependencies(binding);
    return instance;
  }

  private async _createInstanceWithDependencies(binding: Binding) {
    const { lifetime, instance, deps: ɵdeps } = binding;

    if (!isNil(instance) && binding.isDependencyTreeStatic()) {
      return instance;
    }

    if (!binding.hasDependencies()) {
      const instance = binding.factory();

      if (lifetime & InjectorLifetime.Singleton) {
        binding.instance = instance;
      }

      return instance;
    }

    const dependencies = [];

    for (let i = 0; i < (ɵdeps as unknown[]).length; i++) {
      const dep = ɵdeps[i];

      const depInstance = await this.get(dep);
      dependencies.push(depInstance);
    }

    const _instance = await resolveAsyncValue(binding.factory(...dependencies));

    if (lifetime & InjectorLifetime.Singleton) {
      binding.instance = _instance;
    }

    return _instance;
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

      const token = getProviderType(provider);
      const hasBinding = this._records.get(token) ?? [];
      const binding = createBinding(provider);
      const { multi } = binding;
      const record = multi ? [...(hasBinding as Binding[]), binding] : binding;
      this._records.set(binding.token, record);
    }
  }
}
