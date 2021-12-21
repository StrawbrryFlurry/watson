import { ResponseController } from '@core/lifecycle';
import { RouteParamsFactory } from '@core/router';
import { RouterRef } from '@core/router/application-router';
import { FiltersConsumer, GuardsConsumer, PipesConsumer } from '@core/router/interceptors';
import { BaseRoute, CommandRoute, ExecutionContext, PARAM_METADATA, ParameterMetadata } from '@watsonjs/common';
import { Reflector } from '@watsonjs/di';

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
    router: RouterRef
  ): Promise<LifecycleFunction> {
    /*
    const { filters, guards, pipes, paramsFactory } = this.getMetadata(
      handler,
      router
    );

    const applyGuards = this.guardsConsumer.create({
      route: route,
      router: router,
      metadata: guards,
      moduleKey: moduleKey,
    });

    const applyPipes = this.pipesConsumer.create({
      route: route,
      router: router,
      metadata: pipes,
      moduleKey: moduleKey,
    });

    const applyFilters = this.filtersConsumer.create({
      route: route,
      router: router,
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
*/

    try {
      /**
       * Initialize the pipeline and parse
       * the message content
       */
      /*

        await pipeline.invokeFromMessage(message);

        const didPass = await applyFilters(pipeline);

        if (didPass !== true) {
          return;
        }

        await applyGuards(pipeline);
        await applyPipes(pipeline);

        const params = await paramsFactory(context);
        const resolvable = handler.apply(router.instance, params);
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
*/
    } catch {}

    return "lifeCycle" as any;
  }

  public async createApplicationCommandHandler(): Promise<LifecycleFunction> {
    return null as any;
  }

  public async createEventHandler(): Promise<LifecycleFunction> {
    return null as any;
  }

  /**
   * Reflects the metadata key for both
   * the router type and the handler function
   */
  private reflectKey<T>(
    metadataKey: string,
    handler: Function,
    router: RouterRef
  ): T[] {
    const { metatype } = router;

    const handlerMetadata: T[] =
      Reflect.getMetadata(metadataKey, handler) || [];

    const routerMetadata: T[] =
      Reflect.getMetadata(metadataKey, metatype) || [];

    const allMetadata = [...routerMetadata, ...handlerMetadata];
    const metadata = [...new Set(allMetadata)];

    return metadata;
  }

  private async getParamFactory(router: RouterRef, handler: Function) {
    const { paramMetadata, params } = this.reflectParams(router, handler);
    const paramsFactory = (ctx: ExecutionContext) =>
      this.paramsFactory.createFromContext(params, paramMetadata, ctx);
  }

  private reflectParams(router: RouterRef, handler: Function) {
    const { metatype } = router;
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
