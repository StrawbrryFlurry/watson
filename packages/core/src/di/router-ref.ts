import { RouterRef } from '@core/router/application-router';
import {
  BaseRoute,
  ExecutionContext,
  isClassConstructor,
  isFunction,
  isNil,
  MessageSendable,
  W_INT_TYPE,
  ɵInterceptor,
  ɵINTERCEPTOR_TYPE,
} from '@watsonjs/common';
import { DynamicInjector, ModuleRef, Providable, ProviderResolvable, Type, ValueProvider } from '@watsonjs/di';

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

export interface RouterRefInjectableBindings {
  /**
   * Injectables registered by using the class Type
   */
  classInjectables: Type & ɵInterceptor[];
  /**
   * Injectables registered by using a class instance
   */
  instanceInjectables: object[];
  /**
   * Injectables registered as a callback function
   */
  callbackInjectables: {
    cb: () => any;
    deps: Providable[];
  }[];
}

export class RouterRefImpl<T = any> extends RouterRef<T> {
  public root: RouterRef<any>;

  private __interceptors = new Map<ɵINTERCEPTOR_TYPE, InterceptorBinding[]>();

  protected _interceptors = new Map<
    ɵINTERCEPTOR_TYPE,
    RouterRefInjectableBindings
  >();

  constructor(
    metatype: Type,
    providers: ProviderResolvable[],
    moduleRef: ModuleRef
  ) {
    super(metatype, providers, moduleRef);
    /**
     * WatsonComponentsRef only binds `WatsonComponentRef`
     * as a provider for this instance.
     */
    (<DynamicInjector>this._injector).bind(<ValueProvider>{
      provide: RouterRef,
      useValue: this,
      multi: false,
    });
  }

  private _bindInjectables(injectables: ɵInterceptor[]) {
    for (const injectable of injectables) {
      const type = injectable[W_INT_TYPE];
      // const bindings = this._interceptors.get(type) ?? [];

      const isClassCtor = isClassConstructor(injectable);
      const isPlainFunction = isFunction(injectable);

      const injectableBinding: InterceptorBinding = {
        metatype: injectable as unknown as Type,
        isCtxFunction: !isClassCtor && isPlainFunction,
        isInstance: !isClassCtor && !isPlainFunction,
      };

      // this._interceptors.set(type, [...bindings, injectableBinding]);
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

    const injectables: any[] = [];

    //for (let i = 0; i < injectableBindings.length; i++) {
    //  const injectable = injectableBindings[i];
    //  const { isCtxFunction, isInstance, metatype } = injectable;

    //  if (isCtxFunction) {
    //    injectables.push(metatype);
    //    continue;
    //  }

    //  let instance: any = metatype;

    //  if (!isInstance) {
    //    instance = await this._injector.get(metatype, null, <Injector>ctx);
    //  }

    //  const injectableMethod = instance[injectableMethodKey];

    //  if (isFunction(injectableMethod)) {
    //    injectables.push(injectableMethod.bind(instance));
    //  }
    //}

    return injectables;
  }

  public dispatch(route: BaseRoute): Promise<void | MessageSendable> {
    throw new Error("Method not implemented.");
  }
}
