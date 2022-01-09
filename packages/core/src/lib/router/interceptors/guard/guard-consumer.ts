import { RouterRef } from '@core/router';
import { InterceptorsConsumer } from '@core/router/interceptors/interceptors-consumer';
import { CanActivate, ExecutionContext, GuardFn, InterceptorType, UnauthorizedException } from '@watsonjs/common';
import { resolveAsyncValue } from '@watsonjs/di';

export type GuardsConsumerFn = (ctx: ExecutionContext) => Promise<void>;

export class GuardsConsumer extends InterceptorsConsumer<
  GuardFn,
  CanActivate,
  GuardsConsumerFn
> {
  constructor() {
    super(InterceptorType.Guard);
  }

  public create(routerRef: RouterRef, handler: Function): GuardsConsumerFn {
    const guards = this.getInterceptors(routerRef, handler);

    return async (ctx: ExecutionContext) => {
      const interceptors = await this.makeInterceptorCbs(
        ctx,
        guards,
        "canActivate"
      );

      for (let i = 0; i < interceptors.length; i++) {
        const canActivate = interceptors[i];
        const couldActivate = await resolveAsyncValue(canActivate(ctx));

        if (!couldActivate) {
          throw new UnauthorizedException();
        }
      }
    };
  }

  /**
   * Calls the `activate` method in
   * the guard and resolves its value
   */
  private async tryActivate(ctx: ExecutionContext, guard: CanActivate) {
    const { canActivate } = guard;
    const activationResult = await resolveAsyncValue(canActivate(ctx));

    if (activationResult !== true) {
      throw new UnauthorizedException();
    }
  }
}
