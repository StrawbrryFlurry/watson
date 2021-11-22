import { ExecutionContext, isNil, PipelineBase, Providable, Type } from '@watsonjs/common';

import { Injector } from '.';
import { Binding, createResolvedBinding, ExecutionContextImpl, InjectorGetResult } from '..';

export type ContextBindingFactory<
  BindFn extends (provide: Providable, value: any) => void = (
    provide: Providable,
    value: any
  ) => void
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

    const bindFn = (provide: Providable, target: Type) => {
      const binding = createResolvedBinding({
        provide: provide,
        useValue: target,
        multi: false,
      });

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

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any
  ): Promise<R> {
    const binding = this._records.get(typeOrToken);

    if (isNil(binding)) {
      return this.parent.get(typeOrToken, notFoundValue, this);
    }

    return binding.instance;
  }

  public getWithin<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): R | null {
    const binding = this._records.get(typeOrToken);
    return binding?.instance ?? null;
  }
}
