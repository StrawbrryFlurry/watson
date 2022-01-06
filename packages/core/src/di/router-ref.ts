import { WATSON_EXCEPTION_HANDLER_PROVIDER } from '@core/lifecycle';
import { ApplicationRouterRef, RouterRef } from '@core/router/application-router';
import {
  BaseRoute,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  isClassConstructor,
  isFunction,
  isNil,
  MessageSendable,
  PIPE_METADATA,
  PREFIX_METADATA,
  W_INT_TYPE,
  ɵInterceptor,
  ɵINTERCEPTOR_TYPE,
} from '@watsonjs/common';
import { DynamicInjector, ModuleRef, ProviderResolvable, Reflector, Type, UniqueTypeArray } from '@watsonjs/di';

export interface RouterRefInjectableBinding {
  /**
   * Interceptors registered by using the class Type
   */
  classInterceptors?: (Type & ɵInterceptor)[];
  /**
   * Interceptors registered by using a class instance
   */
  instanceInterceptors?: object[];
  /**
   * Interceptors registered as a callback function
   */
  callbackInterceptors?: (() => any)[];
}

export class RouterRefImpl<T extends object = any> extends RouterRef<T> {
  public root: ApplicationRouterRef;

  protected _interceptors = new Map<
    ɵINTERCEPTOR_TYPE,
    RouterRefInjectableBinding
  >();

  constructor(
    metatype: Type,
    providers: ProviderResolvable[],
    moduleRef: ModuleRef
  ) {
    super(metatype, providers, moduleRef);

    const routerProviders = this._makeRouterProviders();
    (<DynamicInjector>this.injector).bind(...routerProviders);

    const interceptors = this.reflectAllInterceptors(metatype);
    this._bindInterceptors(interceptors);
  }

  private _makeRouterProviders(): ProviderResolvable[] {
    return [
      WATSON_EXCEPTION_HANDLER_PROVIDER,
      /**
       * ComponentsRef only binds `ComponentRef`
       * as a provider for this instance.
       */
      {
        provide: RouterRef,
        useValue: this,
      },
    ];
  }

  public getInterceptor(
    type: ɵINTERCEPTOR_TYPE
  ): RouterRefInjectableBinding | null {
    return this._interceptors.get(type) ?? null;
  }

  public reflectAllInterceptors(metatype: Type) {
    const injectables = new UniqueTypeArray<ɵInterceptor>();

    if (isNil(metatype) || isNil(metatype.prototype)) {
      return injectables;
    }

    this._reflectInterceptorOfType(metatype, injectables, GUARD_METADATA);
    this._reflectInterceptorOfType(metatype, injectables, PIPE_METADATA);
    this._reflectInterceptorOfType(metatype, injectables, FILTER_METADATA);
    this._reflectInterceptorOfType(
      metatype,
      injectables,
      EXCEPTION_HANDLER_METADATA
    );
    this._reflectInterceptorOfType(metatype, injectables, PREFIX_METADATA);

    return injectables;
  }

  private _bindInterceptors(interceptors: ɵInterceptor[]) {
    for (const interceptor of interceptors) {
      const type = interceptor[W_INT_TYPE];
      let binding = this._interceptors.get(type);

      if (isNil(binding)) {
        binding = {};
        this._interceptors.set(type, binding);
      }

      const isClassCtor = isClassConstructor(interceptor);
      const isPlainFunction = isFunction(interceptor);

      const isCallbackFunction = !isClassCtor && isPlainFunction;
      const isInstance = !isClassCtor && !isPlainFunction;

      let collection: unknown[];

      if (isCallbackFunction) {
        collection = binding.callbackInterceptors ??= [];
      } else if (isInstance) {
        collection = binding.instanceInterceptors ??= [];
      } else {
        collection = binding.classInterceptors ??= [];
      }

      collection.push(interceptor);
    }
  }

  private _reflectInterceptorOfType(
    metatype: Type,
    interceptors: UniqueTypeArray<ɵInterceptor>,
    metadataKey: string
  ) {
    const classInterceptors = Reflector.reflectMetadata<any[]>(
      metadataKey,
      metatype,
      null,
      []
    );
    interceptors.add(...classInterceptors!);
  }

  public dispatch(route: BaseRoute): Promise<void | MessageSendable> {
    throw new Error("Method not implemented.");
  }
}
