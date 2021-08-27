import {
  EventException,
  FILTER_METADATA,
  GUARD_METADATA,
  IBaseRoute,
  IParamDecoratorMetadata,
  PARAM_METADATA,
  PIPE_METADATA,
  ReceiverDef,
  TFiltersMetadata,
  TGuardsMetadata,
  TPipesMetadata,
} from '@watsonjs/common';
import { Base, Message } from 'discord.js';

import { RouteParamsFactory } from '.';
import { AbstractDiscordAdapter } from '../adapters';
import { CommandPipelineHost, ParsedCommandData } from '../command';
import { InstanceWrapper } from '../injector';
import { ExecutionContextHost, ResponseController } from '../lifecycle';
import { rethrowWithContext } from '../util';
import { resolveAsyncValue } from '../util/resolve-async-value';
import { WatsonContainer } from '../watson-container';
import { CommandRoute } from './command';
import { FiltersConsumer, GuardsConsumer, PipesConsumer } from './interceptors';

/**
 * The handler function will be called by
 * the event proxy to invoke the watson lifecycle
 * when a registered event is fired.
 */
export type LifecycleFunction = (
  routeRef: IBaseRoute,
  eventData: Base[],
  ...args: unknown[]
) => Promise<void>;

export interface RouteMetadata {
  pipes: TPipesMetadata[];
  guards: TGuardsMetadata[];
  filters: TFiltersMetadata[];
  /**
   * Returns an array of data to call
   * the handler with.
   */
  paramsFactory: (ctx: ExecutionContextHost) => Promise<unknown[]>;
}

export type HandlerFactory = (
  route: CommandRoute,
  handler: Function,
  receiver: InstanceWrapper<ReceiverDef>,
  moduleKey: string
) => Promise<LifecycleFunction>;

export class RouteHandlerFactory {
  private paramsFactory = new RouteParamsFactory();
  private responseController = new ResponseController();
  private pipesConsumer = new PipesConsumer(this.container);
  private guardsConsumer = new GuardsConsumer(this.container);
  private filtersConsumer = new FiltersConsumer(this.container);

  private adapterRef: AbstractDiscordAdapter;

  constructor(private container: WatsonContainer) {
    this.adapterRef = this.container.getClientAdapter();
  }

  public async createCommandHandler<RouteResult = any>(
    route: CommandRoute,
    handler: Function,
    receiver: InstanceWrapper<ReceiverDef>,
    moduleKey: string
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

  /**
   * Reflects the metadata key for both
   * the receiver type and the handler function
   */
  private reflectKey<T>(
    metadataKey: string,
    handler: Function,
    receiver: InstanceWrapper<ReceiverDef>
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

  private getMetadata(
    handler: Function,
    receiver: InstanceWrapper<ReceiverDef>
  ): RouteMetadata {
    const guards = this.reflectKey<TGuardsMetadata>(
      GUARD_METADATA,
      handler,
      receiver
    );
    const filters = this.reflectKey<TFiltersMetadata>(
      FILTER_METADATA,
      handler,
      receiver
    );
    const pipes = this.reflectKey<TPipesMetadata>(
      PIPE_METADATA,
      handler,
      receiver
    );

    const params = this.reflectParams(receiver, handler);
    const paramsFactory = (ctx: ExecutionContextHost) => {
      return this.paramsFactory.createFromContext(params, ctx);
    };

    return {
      guards,
      filters,
      pipes,
      paramsFactory,
    };
  }

  private reflectParams(
    receiver: InstanceWrapper<ReceiverDef>,
    handle: Function
  ) {
    return (
      (Reflect.getMetadata(
        PARAM_METADATA,
        receiver.metatype,
        handle.name
      ) as IParamDecoratorMetadata[]) || []
    );
  }
}
