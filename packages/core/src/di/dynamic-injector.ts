import { InjectionToken, Providable, ValueProvider } from '@watsonjs/common';

import { createBinding, INJECTOR, InjectorBloomFilter, ProviderResolvable } from '..';
import { Binding } from './binding';
import { Injector } from './injector';

export class DynamicInjector implements Injector {
  public parent: Injector | null;
  protected _bloom: InjectorBloomFilter;

  protected _parent: Injector | null;

  protected readonly _records: Map<Providable, Binding>;

  constructor(providers: ProviderResolvable[], parent: Injector | null = null) {
    this._records = new Map<Providable, Binding>();
    this.parent = parent;

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

    this._bindProviders(providers);
  }

  public async get<
    T extends InjectionToken | NewableFunction,
    R extends T extends InjectionToken<infer R>
      ? R
      : T extends new (...args: any[]) => infer R
      ? R
      : never
  >(typeOrToken: T): Promise<R> {
    const hasBinding = this._records.get(typeOrToken);

    return "" as R;
  }

  private _bindProviders(providers: ProviderResolvable[]) {
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const binding = createBinding(provider);
      this._records.set(binding.token, binding);
    }
  }

  /**
   * Resolves dependencies for a given
   * provider.
   */
  // public resolveTypeDeps(binding: Binding): ResolvedBinding {
  //   new Binding();
  //
  //   new ResolvedBinding();
  // }

  // private _recursivelyAddProviders(providers) {}
}

// public resolve<T extends any>(
//   typeTokenOrProvider: ProviderResolvable | Providable
// ): T {
//  if (isInjectionToken(typeTokenOrProvider)) {
//    const hash = this._bloom.getHash(typeTokenOrProvider);
//
//    if (isNil(hash) || this._bloom.has(hash)) {
//      if (isNil(this._parent)) {
//        throw new UnknownProviderException(
//          "ReflectiveInjector",
//          typeTokenOrProvider.name,
//          this._moduleRef.name
//        );
//      }
//
//      return this._parent.resolve(typeTokenOrProvider);
//    }
//  }
//
//  const token = getTokenFromProvider(typeTokenOrProvider);
//
//  let binding = this._providers.get(token);
//
//  if (isNil(binding)) {
//    createBindingFromProvider(typeTokenOrProvider, this._moduleRef);
//
//    binding = new Binding();
//  }
//
//  const binding = new Binding();
//
//  return null as T;

function createInstanceOfBinding<
  T extends Binding,
  R extends T extends Binding<infer T, infer F, infer I> ? I : never
>(binding: T): R {
  return binding.instance as R;
}

function resolveProviderDependencies() {}
