import { InterceptorsConsumer } from '@core/router/interceptors/interceptors-consumer';
import { resolveAsyncValue } from '@core/utils';
import { CanActivate, ExecutionContext, PipelineBase, UnauthorizedException } from '@watsonjs/common';

export class GuardsConsumer extends InterceptorsConsumer {
  constructor() {
    super();
  }

  public create({ route, router, metadata, moduleKey }: any) {
    const guards = metadata.map((guard: any) =>
      this.getInstance("guard", guard, "canActivate", moduleKey, router)
    );

    return async (pipeline: PipelineBase) => {
      for (const guard of guards) {
        const ctx = new (ExecutionContext as any)(pipeline, null, route);
        await this.tryActivate(ctx, guard);
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
