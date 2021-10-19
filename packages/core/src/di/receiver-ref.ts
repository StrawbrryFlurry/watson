import { getProviderScope, Injector, ModuleRef, ProviderResolvable } from '@di';
import {
  isClassConstructor,
  isFunction,
  IsInjectable,
  isNil,
  Providable,
  Type,
  UniqueTypeArray,
  W_INJ_TYPE,
} from '@watsonjs/common';

import { InjectorGetResult } from './injector';

interface InjectableBinding {
  /**
   * Means that the injectable
   * is an instance of a class that
   * the injectable specific method
   * can be called on.
   */
  isInstance: boolean;
  /**
   * Means that the injectable
   * is a plain function that
   * we can call with the execution
   * context.
   */
  isCtxFunction: boolean;
  /**
   * Any injectable that does not meet
   * the other requirements means that
   * it is a class reference
   * that we need to create an instance
   * of before we can run the method on it.
   *
   * If it doesn't have any context dependencies
   * we can then replace that injectable with a
   * static instance provider.
   */
  __?: any;
  metatype: Function | Object | Type;
}

export class ReceiverRef<T = any> implements Injector {
  public parent: Injector | null;
  public instance: T | null = null;

  private _injector: Injector;
  private _metatype: Type;
  private _contextProviders = new UniqueTypeArray();

  private _injectables = new Map<number, InjectableBinding[]>();

  constructor(
    metatype: Type,
    providers: ProviderResolvable[],
    injectables: IsInjectable[],
    moduleRef: ModuleRef
  ) {
    this.parent = moduleRef;
    const injectorProviders = this._bindProviders(providers);

    this._bindInjectables(injectables);
    this._injector = Injector.create(
      [
        ...injectorProviders,
        /* We also want to be able to instantiate this receiver using its own injector */ metatype,
      ],
      moduleRef,
      moduleRef,
      true
    );
  }

  private _bindProviders(
    providers: ProviderResolvable[]
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getProviderScope(provider);

        if (providedIn === "ctx") {
          this._contextProviders.add(provider);
          return false;
        }
        return provider;
      })
      .filter(Boolean) as ProviderResolvable[];
  }

  private _bindInjectables(injectables: IsInjectable[]) {
    for (const injectable of injectables) {
      const type = injectable[W_INJ_TYPE];
      const bindings = this._injectables.get(type) ?? [];

      const isClassCtor = isClassConstructor(injectable);
      const isPlainFunction = isFunction(injectable);

      const injectableBinding: InjectableBinding = {
        metatype: injectable,
        isCtxFunction: !isClassCtor && isPlainFunction,
        isInstance: !isClassCtor && !isPlainFunction,
      };

      this._injectables.set(type, [...bindings, injectableBinding]);
    }
  }

  public async getInstance(): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    return this._injector.get(this._metatype);
  }

  public get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): Promise<R> {
    return this._injector.get(typeOrToken);
  }
}
