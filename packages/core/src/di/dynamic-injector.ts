import { getProviderToken, InjectorGetResult, isUseExistingProvider, ModuleRef } from '@core/di';
import { resolveAsyncValue } from '@core/utils';
import {
  CustomProvider,
  FactoryProvider,
  isFunction,
  isNil,
  Providable,
  Type,
  UseExistingProvider,
  ValueProvider,
} from '@watsonjs/common';

import {
  createBinding,
  FactoryFnWithoutDeps,
  getInjectableDef,
  INJECTOR,
  InjectorBloomFilter,
  ProviderResolvable,
} from '..';
import { Binding } from './binding';
import { DependencyGraph } from './dependency-grap';
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

    ɵbindProviders(this, this._records, providers);
  }

  public bind<T extends ProviderResolvable[]>(...providers: T): void {
    ɵbindProviders(this, this._records, providers);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx: Injector | null = null
  ): Promise<R> {
    const { providedIn } = getInjectableDef(typeOrToken);
    let parent = this.parent ?? Injector.NULL;

    if (providedIn === "ctx") {
      if (isNil(ctx)) {
        throw new Error(
          "[DynamicInjector] Cannot resolve a context bound provider in a dynamic injector"
        );
      }

      return ctx.get(typeOrToken);
    }

    if (
      !this._component &&
      !isNil(this._scope) &&
      (providedIn === "module" ||
        (isFunction(providedIn) && this._scope instanceof providedIn))
    ) {
      parent = Injector.NULL;
    }

    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return parent.get(typeOrToken, notFoundValue, ctx);
    }

    return <R>ɵcreateBindingInstance(binding, this, ctx);
  }
}

export function ɵbindProviders(
  injector: Injector,
  records: Map<Providable, Binding | Binding[]>,
  providers: ProviderResolvable[]
): void {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const token = getProviderToken(provider);
    const hasBinding = records.get(token);
    let binding: Binding;

    if (isUseExistingProvider(<CustomProvider>provider)) {
      const { provide, useExisting, multi } = <UseExistingProvider>provider;

      binding = createBinding({
        provide: provide,
        useFactory: () => injector.get(useExisting),
        multi,
      } as FactoryProvider);
    } else {
      binding = createBinding(provider);
    }

    const { multi } = binding;

    if (!isNil(hasBinding) && !multi) {
      throw "Found multiple providers with the same token that are not `multi`";
    }

    const record = multi
      ? [...((hasBinding as Binding[]) ?? []), binding]
      : binding;
    records.set(token, record);
  }
}

export function ɵresolveProvider<
  T extends Providable,
  R extends InjectorGetResult<T>
>(
  typeOrToken: T,
  injector: Injector,
  dependencyGraph: DependencyGraph
): Promise<R> {
  dependencyGraph.checkAndThrow(typeOrToken);
  dependencyGraph.add(typeOrToken);
  return injector.get(typeOrToken);
}

export async function ɵcreateBindingInstance<
  T extends Providable,
  D extends Providable[] | [],
  I extends InjectorGetResult<T>,
  B extends Binding<T, D, I> | Binding<T, D, I>[],
  R extends B extends Binding[] ? I[] : I
>(
  binding: B,
  injector: Injector,
  ctx: Injector | null,
  dependencyGraph: DependencyGraph = new DependencyGraph()
): Promise<R> {
  if (Array.isArray(binding)) {
    const instances: I[] = [];

    for (let i = 0; i < binding.length; i++) {
      const instance = await ɵcreateBindingInstance(
        <Binding>binding[i],
        injector,
        ctx
      );
      instances.push(<I>instance);
    }

    return instances as R;
  }

  const { deps, token } = <Binding<T, D, I>>binding;
  const instance = binding.getInstance(ctx);

  dependencyGraph.checkAndThrow(token);

  if (!isNil(instance) && binding.isDependencyTreeStatic()) {
    return <R>instance;
  }

  if (!binding.hasDependencies()) {
    const instance = await resolveAsyncValue(
      (<FactoryFnWithoutDeps>binding.factory)()
    );

    if (!binding.isTransient()) {
      binding.setInstance(<I>instance, ctx);
    }

    return <R>instance;
  }

  dependencyGraph.add(token);
  const dependencies: Providable[] = [];

  for (let i = 0; i < (<D>deps).length; i++) {
    const dep = deps![i];

    const depInstance = await ɵresolveProvider(dep, injector, dependencyGraph);
    dependencyGraph.remove(dep);
    dependencies.push(depInstance);
  }

  dependencyGraph.remove(token);

  const _instance = await resolveAsyncValue(
    binding.factory(...(<D>dependencies))
  );

  if (!binding.isTransient()) {
    binding.setInstance(<I>_instance, ctx);
  }

  return <R>_instance;
}
