import { CanActivate, PipelineBase, TGuardsMetadata, UnauthorizedException } from '@watsonjs/common';
import { Base } from 'discord.js';

import { ExecutionContextHost } from '../../../lifecycle';
import { resolveAsyncValue } from '../../../util/resolve-async-value';
import { ContextCreatorArguments } from '../context-creator-arguments.interface';
import { InterceptorsConsumer } from '../interceptors-consumer';

export class GuardsConsumer extends InterceptorsConsumer {
  constructor() {
    super();

    this.adapter = container.getClientAdapter();
  }

  public create({
    route,
    receiver,
    metadata,
    moduleKey,
  }: ContextCreatorArguments<TGuardsMetadata>) {
    const guards = metadata.map((guard) =>
      this.getInstance("guard", guard, "canActivate", moduleKey, receiver)
    );

    return async (pipeline: PipelineBase) => {
      const data = pipeline.getEvent<Base[]>();

      for (const guard of guards) {
        const ctx = new ExecutionContextHost(
          pipeline,
          data,
          route,
          this.adapter
        );
        await this.tryActivate(ctx, guard);
      }
    };
  }

  /**
   * Calls the `activate` method in
   * the guard and resolves its value
   */
  private async tryActivate(ctx: ExecutionContextHost, guard: CanActivate) {
    const { canActivate } = guard;
    ctx.setNext(canActivate);
    const activationResult = await resolveAsyncValue(canActivate(ctx));

    if (activationResult !== true) {
      throw new UnauthorizedException();
    }
  }
}
