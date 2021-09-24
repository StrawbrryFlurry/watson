import { isNil, Providable } from '@watsonjs/common';

import { Injector } from '.';
import { ResolvedBinding } from './binding';

export class ContextInjector extends Injector {
  private readonly _contextBindings: Map<any, ResolvedBinding>;

  public readonly parent: Injector;

  public resolve<T extends unknown = any>(typeOrToken: Providable<T>): T {
    const binding = this._contextBindings.get(typeOrToken);

    if (isNil(binding)) {
      return this.parent.resolve(typeOrToken);
    }

    return binding.instance;
  }

  public get(typeOrToken: Providable): ResolvedBinding | null {
    const binding = this._contextBindings.get(typeOrToken);

    if (!isNil(binding)) {
      return binding;
    }

    return this.parent.get?.(typeOrToken) ?? null;
  }

  constructor(parent: Injector, bindings: Map<any, ResolvedBinding>) {
    super(parent);
    this._contextBindings = bindings;
  }

  public static createWithContext<T extends Map<Providable, ResolvedBinding>>(
    parent: Injector,
    bindingFactory: (bindings: T) => T
  ) {
    const bindings = bindingFactory(
      new Map<Providable, ResolvedBinding>() as T
    );
    return new ContextInjector(parent, bindings);
  }
}
