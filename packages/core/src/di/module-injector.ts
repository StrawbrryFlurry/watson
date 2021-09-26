import { UnknownProviderException } from '@exceptions';
import { isInjectionToken, isNil, Providable, ValueProvider } from '@watsonjs/common';

import { Module } from '.';
import { createBinding, getTokenFromProvider, INJECTOR, InjectorBloomFilter, ProviderResolvable } from '..';
import { Binding, ResolvedBinding } from './binding';
import { Injector } from './injector';

/**
 *
 *
 *
 */
export class ModuleInjector implements Injector {
  public parent: Injector | null;
  private _moduleRef: Module;
  protected _bloom: InjectorBloomFilter;

  protected _parent: Injector | null;

  protected readonly _records: Map<Providable, Binding>;

  constructor(providers: ProviderResolvable[]) {
    const records = (this._records = new Map<Providable, Binding>());

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
  }

  public get(typeOrToken: Providable<T>): any {
    return "" as any as ResolvedBinding<T, D, V>;
  }

  public resolve<T extends any>(
    typeTokenOrProvider: ProviderResolvable | Providable
  ): T {
    if (isInjectionToken(typeTokenOrProvider)) {
      const hash = this._bloom.getHash(typeTokenOrProvider);

      if (isNil(hash) || this._bloom.has(hash)) {
        if (isNil(this._parent)) {
          throw new UnknownProviderException(
            "ReflectiveInjector",
            typeTokenOrProvider.name,
            this._moduleRef.name
          );
        }

        return this._parent.resolve(typeTokenOrProvider);
      }
    }

    const token = getTokenFromProvider(typeTokenOrProvider);

    let binding = this._providers.get(token);

    if (isNil(binding)) {
      createBindingFromProvider(typeTokenOrProvider, this._moduleRef);

      binding = new Binding();
    }

    const binding = new Binding();

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

  private _recursivelyAddProviders(providers) {}

  public apply() {}

  public static merge(injectors: ReflectiveInjector[]): ReflectiveInjector {
    return new ReflectiveInjector();
  }
}

function resolveProviderDependencies() {}
