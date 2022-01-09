import { RouterRef } from '@core/router';
import { InterceptorsConsumer } from '@core/router/interceptors/interceptors-consumer';
import { ExecutionContext, InterceptorType, PipeTransform, PipeTransformFn } from '@watsonjs/common';
import { resolveAsyncValue } from '@watsonjs/di';

export type PipesConsumerFn = (ctx: ExecutionContext) => Promise<void>;

export class PipesConsumer extends InterceptorsConsumer<
  PipeTransformFn,
  PipeTransform,
  PipesConsumerFn
> {
  constructor() {
    super(InterceptorType.Pipe);
  }

  public create(routerRef: RouterRef, handler: Function): PipesConsumerFn {
    const pipes = this.getInterceptors(routerRef, handler);

    return async (ctx: ExecutionContext) => {
      return this.transform(
        ctx,
        await this.makeInterceptorCbs(ctx, pipes, "transform")
      );
    };
  }

  /**
   * Calls the `transform` method in all
   * pipes with the previous value of a
   * pipe or the argument wrapper as its
   * source
   */
  private async transform(argumentHost: any, pipes: PipeTransformFn[]) {
    const { arguments: args } = argumentHost;

    for (const argument of args) {
      pipes.reduce(async (previous, pipe) => {
        const value = await previous;
        const transformed = pipe(value);

        return resolveAsyncValue(transformed);
      }, Promise.resolve(argument));
    }
  }
}
