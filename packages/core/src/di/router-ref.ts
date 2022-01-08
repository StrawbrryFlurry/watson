import { WATSON_EXCEPTION_HANDLER_PROVIDER } from '@core/lifecycle';
import { ApplicationRouterRef, RouterBoundInterceptors, RouterRef } from '@core/router/application-router';
import {
  BaseRoute,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  InterceptorType,
  isClassConstructor,
  isFunction,
  isNil,
  MessageSendable,
  PIPE_METADATA,
  PREFIX_METADATA,
  W_INT_SRC,
  W_INT_TYPE,
  ɵInterceptor,
} from '@watsonjs/common';
import { DynamicInjector, ModuleRef, ProviderResolvable, Reflector, Type } from '@watsonjs/di';

export class RouterRefImpl<T extends object = any> extends RouterRef<T> {
  public root: ApplicationRouterRef;

  protected _interceptors = new Map<
    InterceptorType,
    Map<Type, RouterBoundInterceptors>
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

  public getInterceptors(
    type: InterceptorType,
    handler?: Function
  ): Required<RouterBoundInterceptors> {
    const interceptorsOfType = this._interceptors.get(type) ?? null;

    if (isNil(interceptorsOfType)) {
      return {
        callbackInterceptors: [],
        classInterceptors: [],
        instanceInterceptors: [],
      };
    }

    const routerInterceptors = interceptorsOfType.get(RouterRef) ?? {};
    const handlerInterceptors =
      interceptorsOfType.get(handler ?? Function /* Empty */) ?? {};

    return {
      callbackInterceptors: [
        ...(routerInterceptors.callbackInterceptors ?? []),
        ...(handlerInterceptors.callbackInterceptors ?? []),
      ],
      classInterceptors: [
        ...(routerInterceptors.classInterceptors ?? []),
        ...(handlerInterceptors.classInterceptors ?? []),
      ],
      instanceInterceptors: [
        ...(routerInterceptors.instanceInterceptors ?? []),
        ...(handlerInterceptors.instanceInterceptors ?? []),
      ],
    };
  }

  public reflectAllInterceptors(metatype: Type) {
    const injectables: ɵInterceptor[] = [];

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
      const source = interceptor[W_INT_SRC] ?? RouterRef;
      let typeInterceptors = this._interceptors.get(type);

      if (isNil(typeInterceptors)) {
        typeInterceptors = new Map();
        this._interceptors.set(type, typeInterceptors);
      }

      let sourceInterceptors = typeInterceptors.get(source);

      if (isNil(sourceInterceptors)) {
        sourceInterceptors = {};
        typeInterceptors.set(source, sourceInterceptors);
      }

      const isClassCtor = isClassConstructor(interceptor);
      const isPlainFunction = isFunction(interceptor);

      const isCallbackFunction = !isClassCtor && isPlainFunction;
      const isInstance = !isClassCtor && !isPlainFunction;

      let collection: unknown[];

      if (isCallbackFunction) {
        collection = sourceInterceptors.callbackInterceptors ??= [];
      } else if (isInstance) {
        collection = sourceInterceptors.instanceInterceptors ??= [];
      } else {
        collection = sourceInterceptors.classInterceptors ??= [];
      }

      collection.push(interceptor);
    }
  }

  private _reflectInterceptorOfType(
    metatype: Type,
    interceptors: ɵInterceptor[],
    metadataKey: string
  ) {
    const methods = Reflector.reflectMethodsOfType(this.metatype);
    const methodInterceptors = methods.map((method) => {
      return Reflector.reflectMetadata<any[]>(
        metadataKey,
        method,
        null,
        []
      )!.map((interceptor) => {
        // We need to remember, to which method that interceptor
        // was added.
        interceptor[W_INT_SRC] = method;
        return interceptor;
      });
    });

    const classInterceptors = Reflector.reflectMetadata<any[]>(
      metadataKey,
      metatype,
      null,
      []
    );

    interceptors.push(...classInterceptors!, ...methodInterceptors.flat());
  }

  public dispatch(route: BaseRoute): Promise<void | MessageSendable> {
    throw new Error("Method not implemented.");
  }
}
