import { PassThrough, PipelineBase, TFiltersMetadata } from '@watsonjs/common';
import { Base } from 'discord.js';

import { AbstractDiscordAdapter } from '../../../adapters';
import { resolveAsyncValue } from '../../../helpers/resolve-async-value';
import { ExecutionContextHost } from '../../../lifecycle';
import { WatsonContainer } from '../../../watson-container';
import { IContextCreatorArguments } from '../context-creator-arguments.interface';
import { InterceptorsConsumer } from '../interceptors-consumer';

export class FiltersConsumer extends InterceptorsConsumer {
  public adapter: AbstractDiscordAdapter;

  constructor(public container: WatsonContainer) {
    super();

    this.adapter = container.getClientAdapter();
  }

  public create({
    route,
    receiver,
    metadata,
    moduleKey,
  }: IContextCreatorArguments<TFiltersMetadata>) {
    const filters = metadata.map((filter) =>
      this.getInstance<TFiltersMetadata, PassThrough>(
        "filter",
        filter,
        "pass",
        moduleKey,
        receiver
      )
    );

    return async (pipeline: PipelineBase) => {
      for (const filter of filters) {
        const data = pipeline.getEvent<Base[]>();

        const ctx = new ExecutionContextHost(
          pipeline,
          data,
          route,
          this.adapter
        );

        const res = await this.tryPass(ctx, filter);

        if (res === false) {
          return false;
        }
      }

      return true;
    };
  }

  public tryPass(ctx: ExecutionContextHost, filter: PassThrough) {
    const { pass } = filter;
    ctx.setNext(pass);
    return resolveAsyncValue(pass(ctx));
  }
}
