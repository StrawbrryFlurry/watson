import { ExecutionContextImpl } from '@core/lifecycle';
import { resolveAsyncValue } from '@core/utils';
import { ExecutionContext, FactoryProvider, isNil, PipelineBase, Providable, Type } from '@watsonjs/common';

import { Binding, createBinding, createResolvedBinding, getInjectableDef } from './binding';
import { ɵbindProviders, ɵcreateBindingInstance } from './dynamic-injector';
import { Injector, InjectorGetResult, ProviderResolvable } from './injector';
import { InjectorInquirerContext } from './inquirer-context';

export type ContextBindingFactory<
  BindFn extends (
    provide: Providable,
    value: any,
    factory?: boolean
  ) => void = (provide: Providable, value: any, factory?: boolean) => void
> = (bind: BindFn) => void;

export class ContextInjector implements Injector {
  private readonly _records: Map<Providable, Binding>;
  public readonly parent: Injector;

  constructor(
    parent: Injector,
    pipeline: PipelineBase,
    bindingFactory: ContextBindingFactory
  ) {
    const bindings = new Map<Providable, Binding>();
    const ctx = new ExecutionContextImpl(pipeline);

    const bindFn = (
      provide: Providable,
      value: Type,
      factory: boolean = false
    ) => {
      let binding: Binding;

      if (factory) {
        binding = createBinding({
          provide: provide,
          useFactory: value,
        } as FactoryProvider);
      } else {
        binding = createResolvedBinding({
          provide: provide,
          useValue: value,
          multi: false,
        });
      }

      bindings.set(provide, binding);
    };

    bindingFactory(bindFn);

    this.parent = parent;
    this._records = bindings;

    this._records.set(
      ExecutionContext,
      createResolvedBinding({
        provide: ExecutionContext,
        useValue: ctx,
        multi: false,
      })
    );
  }

  public bind(...providers: ProviderResolvable[]) {
    ɵbindProviders(this, this._records, providers);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    /**
     * The context injector can't take another
     * context to resolve a provider.
     */
    ctx: null = null,
    inquirerContext?: InjectorInquirerContext
  ): Promise<R> {
    const { providedIn } = getInjectableDef(typeOrToken);

    if (providedIn !== "ctx") {
      return this.parent.get(typeOrToken, notFoundValue, this);
    }

    const binding: Binding<T> | undefined = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return this.parent.get(typeOrToken, notFoundValue, this, inquirerContext);
    }

    const instance = await ɵcreateBindingInstance(
      <Binding>binding,
      this.parent,
      this,
      new InjectorInquirerContext()
    );

    /**
     * We also allow binding promises in the
     * constructor such that the `bindingFactory`
     * doesn't need to be async. This will
     * resolve the promise in case there is one.
     */
    return resolveAsyncValue(instance);
  }
}
