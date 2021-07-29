import {
  EventException,
  FILTER_METADATA,
  GUARD_METADATA,
  IBaseRoute,
  IParamDecoratorMetadata,
  isNil,
  PARAM_METADATA,
  PIPE_METADATA,
  TFiltersMetadata,
  TGuardsMetadata,
  TPipesMetadata,
  TReceiver,
} from '@watsonjs/common';
import dayjs = require('dayjs');
import { Base, Guild, Message, User } from 'discord.js';

import { RouteParamsFactory } from '.';
import { AbstractDiscordAdapter } from '../adapters';
import { CommandPipelineHost, IParsedCommandData } from '../command';
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
export type TLifecycleFunction = (
  routeRef: IBaseRoute,
  eventData: Base[],
  ...args: unknown[]
) => Promise<void>;

export interface IRouteMetadata {
  pipes: TPipesMetadata[];
  guards: TGuardsMetadata[];
  filters: TFiltersMetadata[];
  /**
   * Returns an array of data to call
   * the handler with.
   */
  paramsFactory: (ctx: ExecutionContextHost) => Promise<unknown[]>;
}

export type THandlerFactory = (
  route: CommandRoute,
  handler: Function,
  receiver: InstanceWrapper<TReceiver>,
  moduleKey: string
) => Promise<TLifecycleFunction>;

export class RouteHandlerFactory {
  private paramsFactory = new RouteParamsFactory();
  private responseController = new ResponseController();
  private pipesConsumer = new PipesConsumer(this.container);
  private guardsConsumer = new GuardsConsumer(this.container);
  private filtersConsumer = new FiltersConsumer(this.container);

  private adapterRef: AbstractDiscordAdapter;

  /**
   * {
   *  [Route]: {
   *    [GuildId]: {
   *      [UserId]: Date
   *    }
   *  }
   * }
   */
  private commandRateLimit = new Map<
    CommandRoute,
    Map<string, Map<string, Date>>
  >();

  constructor(private container: WatsonContainer) {
    this.adapterRef = this.container.getClientAdapter();
  }

  public async createCommandHandler<RouteResult = any>(
    route: CommandRoute,
    handler: Function,
    receiver: InstanceWrapper<TReceiver>,
    moduleKey: string
  ): Promise<TLifecycleFunction> {
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

    const lifeCycle: TLifecycleFunction = async (
      route: CommandRoute,
      event: [Message],
      parsed: IParsedCommandData
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

        // Throws rate limit exception if
        // the check doesn't pass
        this.checkRateLimit(pipeline);

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

  private checkRateLimit(pipeline: CommandPipelineHost) {
    const { user, route } = pipeline;
    const { configuration } = route;
    const guild = pipeline.getGuild();

    if (!configuration.cooldown) {
      return true;
    }

    const { timeout } = configuration.cooldown;
    const existingRateLimit = this.getRateLimit(route, user, guild);

    if (isNil(existingRateLimit)) {
      return true;
    }

    const secondsPassed = dayjs(existingRateLimit).diff(new Date(), "seconds");

    if (secondsPassed < timeout) {
      throw new RateLimitException();
    }

    this.addRateLimit(route, user, guild);
    return true;
  }

  private addRateLimit(route: CommandRoute, user: User, guild: Guild): void {
    const guildMap = this.commandRateLimit.get(route);
    const userId = user.id;
    const guildId = guild.id;

    if (isNil(guildMap)) {
      this.commandRateLimit.set(route, new Map());
      return this.addRateLimit(route, user, guild);
    }

    const userMap = guildMap.get(guildId);

    if (isNil(userMap)) {
      guildMap.set(guildId, new Map());
      return this.addRateLimit(route, user, guild);
    }

    userMap.set(userId, new Date());
  }

  private getRateLimit(route: CommandRoute, user: User, guild: Guild) {
    const userId = user.id;
    const guildId = guild.id;

    return this.commandRateLimit.get(route)?.get(guildId)?.get(userId);
  }

  /**
   * Reflects the metadata key for both
   * the receiver type and the handler function
   */
  private reflectKey<T>(
    metadataKey: string,
    handler: Function,
    receiver: InstanceWrapper<TReceiver>
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
    receiver: InstanceWrapper<TReceiver>
  ): IRouteMetadata {
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
    receiver: InstanceWrapper<TReceiver>,
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
