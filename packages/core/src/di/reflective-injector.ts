import { UnknownProviderException } from '@exceptions';
import {
  INJECTABLE_METADATA,
  InjectableMetadata,
  InjectorScope,
  isInjectionToken,
  isNil,
  Providable,
} from '@watsonjs/common';

import { Module, Reflector } from '.';
import {
  createBindingFromProvider,
  getTokenFromProvider,
  InjectorBloomFilter,
  isCustomProvider,
  ProviderResolvable,
} from '..';
import { Binding, FactoryFn, NewableTo, ResolvedBinding } from './binding';
import { Injector } from './injector';

/**
 * Injector type that uses type reflection
 * to recursively resolve a given type or token.
 *
 * This type of injector is used as the injector
 * for a WatsonModule and will usually be the parent
 * injector for a ContextInjector.
 */
export class ReflectiveInjector implements Injector {
  private _reflector: Reflector = new Reflector();
  private _moduleRef: Module;
  protected _bloom: InjectorBloomFilter;

  protected _parent: Injector | null;

  /** Bindings that were already resolved by the Injector */
  protected readonly _records: Map<Binding, ResolvedBinding> = new Map<
    Binding,
    ResolvedBinding
  >();

  protected readonly _providers: Map<Providable, Binding> = new Map<
    Providable,
    Binding
  >();

  public get<
    T extends NewableTo<V> | FactoryFn<V> = any,
    D extends any[] = any,
    V extends any = any
  >(typeOrToken: Providable<T>): ResolvedBinding<T, D, V> {
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

  private resolveProviderScope(typeOrProvider: ProviderResolvable) {
    if (isCustomProvider(typeOrProvider)) {
      return typeOrProvider.scope ?? InjectorScope.Singleton;
    }

    return this._reflector.reflectMetadata<InjectableMetadata>(
      INJECTABLE_METADATA,
      typeOrProvider
    )!;
  }

  public static async resolveAndCreate(module: Module, parent?: Injector) {
    const { container } = module;
    const injector = new ReflectiveInjector();
    injector._moduleRef = module;
    injector._bloom = new InjectorBloomFilter(container);
    injector._parent = parent ?? null;

    injector.resolve();
  }

  public static merge(injectors: ReflectiveInjector[]): ReflectiveInjector {
    return new ReflectiveInjector();
  }
}

function resolveProviderDependencies() {}
