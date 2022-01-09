import { RouterBoundInterceptors, RouterRef } from '@core/router';
import { ExecutionContext, InterceptorType } from '@watsonjs/common';

export abstract class InterceptorsConsumer<
  F extends (...args: any[]) => any,
  T extends object,
  R extends Function
> {
  public type: InterceptorType;

  constructor(type: InterceptorType) {
    this.type = type;
  }

  public abstract create(routerRef: RouterRef, handler: Function): R;

  protected getInterceptors(
    routerRef: RouterRef,
    handler: Function
  ): Required<RouterBoundInterceptors> {
    return routerRef.getInterceptors(this.type, handler);
  }

  protected async makeInterceptorCbs(
    ctx: ExecutionContext,
    interceptors: Required<RouterBoundInterceptors<any, T, F>>,
    key: keyof T
  ): Promise<F[]> {
    const { callbackInterceptors, classInterceptors, instanceInterceptors } =
      interceptors;

    const interceptorCbs: F[] = [];

    for (let i = 0; i < callbackInterceptors.length; i++) {
      interceptorCbs.push(callbackInterceptors[i]);
    }

    for (let i = 0; i < classInterceptors.length; i++) {
      const classInterceptor = classInterceptors[i];
      const instance: T = await ctx.get(classInterceptor);
      instanceInterceptors.push(instance);
    }

    for (let i = 0; i < instanceInterceptors.length; i++) {
      const instance = instanceInterceptors[i];
      interceptorCbs.push(<F>(<any>instance[key]).bind(instance));
    }

    return interceptorCbs;
  }
}
