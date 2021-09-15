import { Module, Reflector } from '.';
import { Binding, ResolvedBinding } from './binding';
import { Providable } from './injection-token';
import { Injector } from './injector';

/**
 * Resolves type dependencies using reflection.
 */
export class ReflectiveInjector extends Injector {
  private _reflector: Reflector = new Reflector();

  /** Bindings that were already resolved by the Injector */
  protected readonly _records: Map<Binding, ResolvedBinding> = new Map<
    Binding,
    ResolvedBinding
  >();

  constructor(module: Module, parent?: Injector) {
    super(module, parent);
  }

  public resolve<T extends any>(typeOrToken: Providable<T>): T {
    this.module.providers;

    return null as T;
  }

  /**
   * Resolves dependencies for a given
   * provider.
   */
  public resolveTypeDeps(binding: Binding): ResolvedBinding {
    new Binding();

    new ResolvedBinding();
  }
}
