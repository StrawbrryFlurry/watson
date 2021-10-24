import { ExecutionContext, isNil, Providable } from '@watsonjs/common';

import { Injector } from '.';
import { Binding, createResolvedBinding, InjectorGetResult } from '..';

export class ContextInjector implements Injector {
  private readonly records: Map<Providable, Binding>;
  public readonly parent: Injector;

  constructor(
    parent: Injector,
    ctx: ExecutionContext,
    bindings: Map<Providable, Binding>
  ) {
    this.parent = parent;
    this.records = bindings;

    this.records.set(
      ExecutionContext,
      createResolvedBinding({
        provide: ExecutionContext,
        useValue: ctx,
        multi: false,
      })
    );
  }

  public static createWithContext<T extends Map<Providable, Binding>>(
    parent: Injector,
    ctx: ExecutionContext,
    bindingFactory: (bindings: T) => void
  ) {
    const bindings = new Map<Providable, Binding>() as T;
    bindingFactory(bindings);
    return new ContextInjector(parent, ctx, bindings);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any
  ): Promise<R> {
    const binding = this.records.get(typeOrToken);

    if (isNil(binding)) {
      return this.parent.get(typeOrToken, notFoundValue, this);
    }

    return binding.instance;
  }

  public getWithin<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): R | null {
    const binding = this.records.get(typeOrToken);
    return binding?.instance ?? null;
  }
}
