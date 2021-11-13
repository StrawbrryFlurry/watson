import { InterceptorsConsumer } from '@core/router/interceptors/interceptors-consumer';
import { resolveAsyncValue } from '@core/utils';
import { PipelineBase, PipeTransform } from '@watsonjs/common';

export class PipesConsumer extends InterceptorsConsumer {
  constructor() {
    super();
  }

  public create({ router, metadata, moduleKey }: any) {
    const pipes = metadata.map((pipe: any) =>
      this.getInstance<PipesConsumer, PipeTransform>(
        "pipe",
        pipe,
        "transform",
        moduleKey,
        router
      )
    );

    return (pipeline: PipelineBase) => {
      const { argumentHost } = pipeline as any;
      return this.transform(argumentHost, pipes);
    };
  }

  /**
   * Calls the `transform` method in all
   * pipes with the previous value of a
   * pipe or the argument wrapper as its
   * source
   */
  private async transform(argumentHost: any, pipes: PipeTransform[]) {
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
