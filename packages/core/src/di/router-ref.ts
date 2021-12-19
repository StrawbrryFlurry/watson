import { RouterRef } from '@core/router/application-router';
import {
  BaseRoute,
  ExecutionContext,
  isClassConstructor,
  isFunction,
  IsInterceptor,
  isNil,
  MessageSendable,
  Providable,
  Type,
  UniqueTypeArray,
  ValueProvider,
  W_INT_TYPE,
  ɵINTERCEPTOR_TYPE,
} from '@watsonjs/common';

import { Binding, createBinding, getInjectableDef } from './binding';
import { Injector, InjectorGetResult, NOT_FOUND, ProviderResolvable } from './injector';
import { ModuleRef } from './module-ref';

interface InterceptorBinding {
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

export class RouterRefImpl<T = any> extends RouterRef<T> {
  public root: RouterRef<any>;
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
   * router.
   */
  private _contextProviders = new UniqueTypeArray<Binding>();

  private _interceptors = new Map<ɵINTERCEPTOR_TYPE, InterceptorBinding[]>();

  constructor(
    metatype: Type,
    providers: ProviderResolvable[],
    injectables: IsInterceptor[],
    moduleRef: ModuleRef
  ) {
    super();
    this.parent = moduleRef;
    this.metatype = metatype;
    const injectorProviders = this._bindProviders(providers);

    this._bindInjectables(injectables);
    this._injector = Injector.create(
      [
        ...injectorProviders,
        /* We also want to be able to instantiate this router using its own injector */ metatype,
        {
          provide: RouterRef,
          useValue: this,
          multi: false,
        } as ValueProvider,
      ],
      moduleRef,
      moduleRef
    );
  }

  private _bindProviders(
    providers: ProviderResolvable[]
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getInjectableDef(provider);

        if (providedIn === "ctx") {
          this._contextProviders.add(createBinding(provider));
          return false;
        }
        return provider;
      })
      .filter(Boolean) as ProviderResolvable[];
  }

  private _bindInjectables(injectables: IsInterceptor[]) {
    for (const injectable of injectables) {
      const type = injectable[W_INT_TYPE];
      const bindings = this._interceptors.get(type) ?? [];

      const isClassCtor = isClassConstructor(injectable);
      const isPlainFunction = isFunction(injectable);

      const injectableBinding: InterceptorBinding = {
        metatype: injectable as unknown as Type,
        isCtxFunction: !isClassCtor && isPlainFunction,
        isInstance: !isClassCtor && !isPlainFunction,
      };

      this._interceptors.set(type, [...bindings, injectableBinding]);
    }
  }

  public async createInjectablesByKey(
    key: ɵINTERCEPTOR_TYPE,
    injectableMethodKey: string,
    ctx?: ExecutionContext
  ): Promise<((...args: any[]) => any)[]> {
    const injectableBindings = this._interceptors.get(key);

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

  public dispatch(route: BaseRoute): Promise<void | MessageSendable> {
    throw new Error("Method not implemented.");
  }

  public async getInstance(ctx?: Injector): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    return this._injector.get(this.metatype, null, ctx);
  }

  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R> {
    const resolved = await this._injector.get(typeOrToken, NOT_FOUND, ctx);

    /**
     * It's okay for router injectors not to
     * have all providers that they require
     * to resolve a given value. Usually we
     * need to use the module injector which
     * holds all resolvable providers available
     * to routers in their module scope.
     */
    if (resolved === NOT_FOUND) {
      return (
        this.parent?.get(typeOrToken, notFoundValue, ctx) ??
        // If the router isn't part of a module, throw a NullInjector error.
        Injector.NULL.get(typeOrToken, notFoundValue)
      );
    }

    return resolved as R;
  }
}
