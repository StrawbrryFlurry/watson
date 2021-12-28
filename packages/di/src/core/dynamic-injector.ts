import { WatsonComponentRef } from '@di/core/component-ref';
import { Injector, InjectorGetResult, ProviderResolvable } from '@di/core/injector';
import { InjectorInquirerContext } from '@di/core/inquirer-context';
import { ModuleRef } from '@di/core/module-ref';
import { AfterResolution } from '@di/hooks';
import {
  CustomProvider,
  FactoryProvider,
  InjectorLifetime,
  Providable,
  UseExistingProvider,
  ValueProvider,
} from '@di/providers';
import { Type } from '@di/types';
import { resolveAsyncValue } from '@di/utils';
import { isFunction, isNil } from '@di/utils/common';

import {
  Binding,
  createBinding,
  FactoryFnWithoutDeps,
  getInjectableDef,
  getProviderToken,
  isUseExistingProvider,
} from './binding';
import { DependencyGraph } from './dependency-graph';
import { InjectorBloomFilter } from './injector-bloom-filter';
import { INJECTOR } from './injector-token';

export class DynamicInjector implements Injector {
  public parent: Injector | null;
  protected _bloom: InjectorBloomFilter;
  protected _isComponent: boolean;

  protected readonly _records: Map<Providable, Binding | Binding[]>;

  public get scope(): Type | null {
    return this._scope?.metatype ?? null;
  }
  protected _scope: ModuleRef | null;

  constructor(
    providers: ProviderResolvable[],
    parent: Injector | null,
    scope: ModuleRef | null
  ) {
    this._records = new Map<Providable, Binding | Binding[]>();
    this.parent = parent;
    this._scope = scope;

    // All components and only components
    // provide themselves as a component ref.
    this._isComponent = providers.some(
      (provider) => (<CustomProvider>provider)?.provide === WatsonComponentRef
    );

    if (!isNil(this.scope)) {
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
      !this._isComponent &&
      !isNil(this.scope) &&
      (providedIn === "module" ||
        (isFunction(providedIn) && this.scope === providedIn))
    ) {
      parent = Injector.NULL;
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
      /**
       * If this injector is the root injector,
       * it is likely that some providers are
       * added to this injector's provider scope
       * multiple times via modules or through
       * providedIn "root" `@Injectable` declarations.
       *
       * We can just skip over them as they were added
       * to the root injector before.
       */
      const { providedIn } = getInjectableDef(token);
      if (providedIn === "root") {
        continue;
      }

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

  const { deps, token, lifetime } = <Binding<T, D, I>>binding;
  const dependencyGraph = (inquirerContext.dependencyGraph ??=
    new DependencyGraph());
  let lookupCtx = ctx;

  /**
   * When dealing with module scoped dependencies
   * we're using the module injector as the key
   * for the binding instance map.
   */
  if (lifetime & InjectorLifetime.Module) {
    lookupCtx = injector;
  }

  const instance = binding.getInstance(lookupCtx);

  if (!isNil(instance) && binding.isDependencyTreeStatic()) {
    return <R>instance;
  }

  if (!binding.hasDependencies()) {
    const instance = await resolveAsyncValue(
      (<FactoryFnWithoutDeps>binding.factory)()
    );

    if (!binding.isTransient()) {
      binding.setInstance(<I>instance, lookupCtx);
    }

    return <R>instance;
  }

  dependencyGraph.add(token);
  const dependencies: unknown[] = [];

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

  const updatedDependencies = await binding.callBeforeResolutionHook(
    injector,
    <D>dependencies,
    inquirerContext
  );

  const _instance = await resolveAsyncValue(
    binding.factory(...(<D>updatedDependencies))
  );

  const { afterResolution } = <AfterResolution>_instance ?? {};

  if (isFunction(afterResolution)) {
    await resolveAsyncValue(afterResolution.call(_instance, injector));
  }

  if (!binding.isTransient()) {
    binding.setInstance(<I>_instance, lookupCtx);
  }

  return <R>_instance;
}
