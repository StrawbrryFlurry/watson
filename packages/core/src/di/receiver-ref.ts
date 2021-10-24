import { Binding, createBinding, getProviderScope, Injector, ModuleRef, ProviderResolvable } from '@core/di';
import {
  ExecutionContext,
  isClassConstructor,
  isFunction,
  IsInjectable,
  isNil,
  Providable,
  Type,
  UniqueTypeArray,
  W_INJ_TYPE,
  ɵINJECTABLE_TYPE,
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
  metatype: Function | Type;
}

export class ReceiverRef<T = any> implements Injector {
  public readonly metatype: Type;

  public parent: ModuleRef | null;
  public instance: T | null = null;

  public get name() {
    return this.metatype.name;
  }

  private _injector: Injector;

  /**
   * Context providers are not bound to the injector of the
   * component or the module but instead are bound to
   * every context injector created for an event bound in this
   * receiver.
   */
  private _contextProviders = new UniqueTypeArray<Binding>();

  private _injectables = new Map<ɵINJECTABLE_TYPE, InjectableBinding[]>();

  constructor(
    metatype: Type,
    providers: ProviderResolvable[],
    injectables: IsInjectable[],
    moduleRef: ModuleRef
  ) {
    this.parent = moduleRef;
    this.metatype = metatype;
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
          this._contextProviders.add(createBinding(provider));
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
        metatype: injectable as unknown as Type,
        isCtxFunction: !isClassCtor && isPlainFunction,
        isInstance: !isClassCtor && !isPlainFunction,
      };

      this._injectables.set(type, [...bindings, injectableBinding]);
    }
  }

  public async createInjectablesByKey(
    key: ɵINJECTABLE_TYPE,
    injectableMethodKey: string,
    ctx?: ExecutionContext
  ): Promise<((...args: any[]) => any)[]> {
    const injectableBindings = this._injectables.get(key);

    if (isNil(injectableBindings)) {
      return [];
    }

    const injectables = [];

    for (let i = 0; i < injectableBindings.length; i++) {
      const injectable = injectableBindings[i];
      const { isCtxFunction, isInstance, metatype } = injectable;

      if (isCtxFunction) {
        injectables.push(metatype);
        continue;
      }

      let instance: any = metatype;

      if (!isInstance) {
        instance = await this._injector.get(metatype, null, ctx as Injector);
      }

      const injectableMethod = instance[injectableMethodKey];

      if (isFunction(injectableMethod)) {
        injectables.push(injectableMethod.bind(instance));
      }
    }

    return injectables;
  }

  public async getInstance(ctx?: Injector): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    return this._injector.get(this.metatype, null, ctx);
  }

  public get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R> {
    return this._injector.get(typeOrToken, notFoundValue, ctx);
  }
}
