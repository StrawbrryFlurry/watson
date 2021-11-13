import { InterceptorsConsumer } from '@core/router/interceptors';
import { resolveAsyncValue } from '@core/utils';
import { ExecutionContext, FiltersMetadata, PassThrough, PipelineBase } from '@watsonjs/common';
import { Base } from 'discord.js';

export class FiltersConsumer extends InterceptorsConsumer {
  constructor() {
    super();
  }

  public create({ route, router, metadata, moduleKey }: any) {
    const filters = metadata.map((filter: any) =>
      this.getInstance<FiltersMetadata, PassThrough>(
        "filter",
        filter,
        "pass",
        moduleKey,
        router
      )
    );

    return async (pipeline: PipelineBase) => {
      for (const filter of filters) {
        const data = pipeline.getEvent<Base[]>();

        const ctx = new (ExecutionContext as any)(
          pipeline,
          data,
          route,
          (this as any).adapter
        );

        const res = await this.tryPass(ctx, filter);

        if (res === false) {
          return false;
        }
      }

      return true;
    };
  }

  public tryPass(ctx: ExecutionContext, filter: PassThrough) {
    const { pass } = filter;
    ctx.setNext(pass);
    return resolveAsyncValue(pass(ctx));
  }
}
