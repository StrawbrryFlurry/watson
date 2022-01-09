import { RouterRef } from '@core/router/application-router';
import { InterceptorsConsumer } from '@core/router/interceptors';
import { ExecutionContext, FilterFn, InterceptorType, PassThrough } from '@watsonjs/common';
import { resolveAsyncValue } from '@watsonjs/di';

export type FiltersConsumerFn = (
  pipeline: ExecutionContext
) => Promise<boolean>;

export class FiltersConsumer extends InterceptorsConsumer<
  FilterFn,
  PassThrough,
  FiltersConsumerFn
> {
  constructor() {
    super(InterceptorType.Filter);
  }

  public create(routerRef: RouterRef, handler: Function): FiltersConsumerFn {
    const filters = this.getInterceptors(routerRef, handler);

    return async (ctx: ExecutionContext) => {
      const interceptors = await this.makeInterceptorCbs(ctx, filters, "pass");

      for (let i = 0; i < interceptors.length; i++) {
        const filter = interceptors[i];
        const pass = await resolveAsyncValue(filter(ctx));

        if (!pass) {
          return false;
        }
      }

      return true;
    };
  }
}
