import { ReceiverRef, Reflector } from '@core/di';
import { ResponseController } from '@core/lifecycle';
import { FiltersConsumer, GuardsConsumer, PipesConsumer, RouteParamsFactory } from '@router';
import { BaseRoute, ExecutionContext, PARAM_METADATA, ParameterMetadata, ReceiverDef } from '@watsonjs/common';

/**
 * The handler function will be called by
 * the event proxy to invoke the watson lifecycle
 * when a registered event is fired.
 */
export type LifecycleFunction = (
  routeRef: BaseRoute,
  eventData: unknown[],
  ...args: unknown[]
) => Promise<void>;

export class RouteHandlerFactory {
  private paramsFactory = new RouteParamsFactory();
  private responseController = new ResponseController();

  private pipesConsumer = new PipesConsumer();
  private guardsConsumer = new GuardsConsumer();
  private filtersConsumer = new FiltersConsumer();

  public async createCommandHandler<RouteResult = any>(
    route: CommandRoute,
    handler: Function,
    receiver: InstanceWrapper<ReceiverDef>
  ): Promise<LifecycleFunction> {
    const { filters, guards, pipes, paramsFactory } = this.getMetadata(
      handler,
      receiver
    );

    const applyGuards = this.guardsConsumer.create({
      route: route,
      receiver: receiver,
      metadata: guards,
      moduleKey: moduleKey,
    });

    const applyPipes = this.pipesConsumer.create({
      route: route,
      receiver: receiver,
      metadata: pipes,
      moduleKey: moduleKey,
    });

    const applyFilters = this.filtersConsumer.create({
      route: route,
      receiver: receiver,
      metadata: filters,
      moduleKey: moduleKey,
    });

    const lifeCycle: LifecycleFunction = async (
      route: CommandRoute,
      event: [Message],
      parsed: ParsedCommandData
    ) => {
      const { prefix, command } = parsed;
      const [message] = event;
      const pipeline = new CommandPipelineHost(command, prefix, route);
      const context = new ExecutionContextHost(
        pipeline,
        event,
        route,
        this.adapterRef
      );

      try {
        /**
         * Initialize the pipeline and parse
         * the message content
         */
        await pipeline.invokeFromMessage(message);

        const didPass = await applyFilters(pipeline);

        if (didPass !== true) {
          return;
        }

        await applyGuards(pipeline);
        await applyPipes(pipeline);

        const params = await paramsFactory(context);
        const resolvable = handler.apply(receiver.instance, params);
        const result = (await resolveAsyncValue(resolvable)) as RouteResult;

        await this.responseController.apply(context, result);
      } catch (err) {
        if (err instanceof EventException) {
          rethrowWithContext(err, context);
        } else {
          throw err;
        }
      }
    };

    return lifeCycle;
  }

  public createInteractionHandler() {}

  /**
   * Reflects the metadata key for both
   * the receiver type and the handler function
   */
  private reflectKey<T>(
    metadataKey: string,
    handler: Function,
    receiver: ReceiverRef
  ): T[] {
    const { metatype } = receiver;

    const handlerMetadata: T[] =
      Reflect.getMetadata(metadataKey, handler) || [];

    const receiverMetadata: T[] =
      Reflect.getMetadata(metadataKey, metatype) || [];

    const allMetadata = [...receiverMetadata, ...handlerMetadata];
    const metadata = [...new Set(allMetadata)];

    return metadata;
  }

  private async getParamFactory(receiver: ReceiverRef, handler: Function) {
    const { paramMetadata, params } = this.reflectParams(receiver, handler);
    const paramsFactory = (ctx: ExecutionContext) =>
      this.paramsFactory.createFromContext(params, paramMetadata, ctx);
  }

  private reflectParams(receiver: ReceiverRef, handler: Function) {
    const { metatype } = receiver;
    const { name } = handler;

    const paramMetadata =
      Reflector.reflectMetadata<ParameterMetadata[]>(
        PARAM_METADATA,
        metatype,
        name
      ) ?? [];

    const params = Reflector.reflectMethodParameters(metatype, name) ?? [];

    return {
      paramMetadata,
      params,
    };
  }
}
