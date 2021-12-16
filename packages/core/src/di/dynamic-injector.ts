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
  Binding,
  createBinding,
  FactoryFnWithoutDeps,
  getInjectableDef,
  getProviderToken,
  isUseExistingProvider,
} from './binding';
import { DependencyGraph } from './dependency-grap';
import { Injector, InjectorGetResult, ProviderResolvable } from './injector';
import { InjectorBloomFilter } from './injector-bloom-filter';
import { INJECTOR } from './injector-token';
import { InjectorInquirerContext } from './inquirer-context';
import { ModuleRef } from './module';
import { NullInjector } from './null-injector';

export class DynamicInjector implements Injector {
  public parent: Injector | null;
  protected _bloom: InjectorBloomFilter;

  protected readonly _records: Map<Providable, Binding | Binding[]>;

  protected _scope: Type | null;

  constructor(
    providers: ProviderResolvable[],
    parent: Injector | null,
    scope: Type | null
  ) {
    this._records = new Map<Providable, Binding | Binding[]>();
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
    ctx: Injector | null = null,
    inquirerContext: InjectorInquirerContext = new InjectorInquirerContext()
  ): Promise<R> {
    const { providedIn } = getInjectableDef(typeOrToken);
    let parent = this.parent ?? new NullInjector();

    if (providedIn === "ctx") {
      if (isNil(ctx)) {
        throw new Error(
          "[DynamicInjector] Cannot resolve a context bound provider in a dynamic injector"
        );
      }

      return ctx.get(typeOrToken);
    }

    if (
      !isNil(this._scope) &&
      (providedIn === "module" ||
        (isFunction(providedIn) && this._scope instanceof providedIn))
    ) {
      parent = new NullInjector();
    }

    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      if (providedIn === InjectorInquirerContext) {
        return <R>inquirerContext;
      }

      return parent.get(typeOrToken, notFoundValue, ctx, inquirerContext);
    }

    return <R>ɵcreateBindingInstance(binding, this, ctx, inquirerContext);
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
  ctx: Injector | null,
  inquirerContext: InjectorInquirerContext
): Promise<R> {
  const { dependencyGraph } = inquirerContext;
  dependencyGraph!.checkAndThrow(typeOrToken);
  dependencyGraph!.add(typeOrToken);
  return injector.get(typeOrToken, null, ctx, inquirerContext);
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
  inquirerContext: InjectorInquirerContext
): Promise<R> {
  if (Array.isArray(binding)) {
    const instances: I[] = [];
    for (let i = 0; i < binding.length; i++) {
      const instance = await ɵcreateBindingInstance(
        <Binding>binding[i],
        injector,
        ctx,
        inquirerContext
      );
      instances.push(<I>instance);
    }

    return instances as R;
  }

  const { deps, token } = <Binding<T, D, I>>binding;
  const dependencyGraph = (inquirerContext.dependencyGraph ??=
    new DependencyGraph());

  const instance = binding.getInstance(ctx);

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

    // In this instance skip
    if (dep === InjectorInquirerContext) {
      dependencies.push(<any>inquirerContext.seal());
      continue;
    }

    const dependencyContext = inquirerContext.clone(<Binding>binding, i);
    const depInstance = await ɵresolveProvider(
      dep,
      injector,
      ctx,
      dependencyContext
    );
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
