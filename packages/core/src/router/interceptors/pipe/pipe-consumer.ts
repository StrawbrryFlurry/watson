import { PipelineBase, PipeTransform, TPipesMetadata } from '@watsonjs/common';

import { CommandArgumentsHost, CommandPipelineHost } from '../../../command';
import { resolveAsyncValue } from '../../../util/resolve-async-value';
import { ContextCreatorArguments } from '../context-creator-arguments.interface';
import { InterceptorsConsumer } from '../interceptors-consumer';

export class PipesConsumer extends InterceptorsConsumer {
  constructor() {
    super();
  }

  public create({
    receiver,
    metadata,
    moduleKey,
  }: ContextCreatorArguments<TPipesMetadata>) {
    const pipes = metadata.map((pipe) =>
      this.getInstance<TPipesMetadata, PipeTransform>(
        "pipe",
        pipe,
        "transform",
        moduleKey,
        receiver
      )
    );

    return (pipeline: PipelineBase) => {
      const { argumentHost } = pipeline as CommandPipelineHost;
      return this.transform(argumentHost, pipes);
    };
  }

  /**
   * Calls the `transform` method in all
   * pipes with the previous value of a
   * pipe or the argument wrapper as its
   * source
   */
  private async transform(
    argumentHost: CommandArgumentsHost,
    pipes: PipeTransform[]
  ) {
    const { arguments: args } = argumentHost;

    for (const argument of args) {
      pipes.reduce(async (previous, pipe) => {
        const value = await previous;
        const transformed = pipe.transform(value);

        return resolveAsyncValue(transformed);
      }, Promise.resolve(argument));
    }
  }
}
