import { createBindingFromProvider, getTokenFromProvider, Injector, ResolvedBinding } from '@di';
import { InjectorScope } from 'packages/common/src/decorators';
import { Providable, ValueProvider } from 'packages/common/src/interfaces';
import { isNil } from 'packages/common/src/utils';

// TODO: Prolly replace with a default injector.

/**
 * The static injector holds
 * static dependencies similar to
 * the context injector. Usually a static
 * injector is used as the root injector
 * which holds application wide providers
 * which don't need to be resolved by
 * the di framework.
 */
export class StaticInjector implements Injector {
  public parent: Injector | null;

  private _records = new Map<Providable, ResolvedBinding>();

  /**
   * The static injector is meant to be
   * used with static, already resolved
   * values or references to parts of
   * the framework. Therefore we don't
   * resolve any dependencies of a provider
   * even if it would require some. We also
   * don't check if there are any dependencies
   * to be injected into the provider. Be aware
   * of this when using this kind of injector.
   */
  public resolve<T extends ResolvedBinding = any>(
    provider: ValueProvider,
    scope: InjectorScope
  ): T {
    const token = getTokenFromProvider(provider);
    const hasBinding = this._records.get(token);

    if (!isNil(hasBinding)) {
      return hasBinding as T;
    }

    const binding = createBindingFromProvider(provider, null, scope);
    const instance = binding.ɵfactory();
    const resolved = new ResolvedBinding(binding, instance);

    this._records.set(token, resolved);
    return resolved as T;
  }

  public get(typeOrToken: Providable): ResolvedBinding | null {
    return this.get(typeOrToken) ?? null;
  }

  /**
   * Calls the {@link resolve} method
   * on a new injector class using the
   * providers provided. Returns
   * this new injector instance.
   */
  public resolveAndCreate(
    providers: ValueProvider[],
    parent?: Injector
  ): StaticInjector {
    const injector = new StaticInjector();
    injector.parent = parent ?? null;

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      injector.resolve(provider, InjectorScope.Singleton);
    }

    return injector;
  }
}
