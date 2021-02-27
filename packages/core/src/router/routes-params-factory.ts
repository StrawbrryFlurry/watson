import {
  AskFunction,
  CollectFunction,
  CommandContextData,
  ExecutionContext,
  IInquirableMetadata,
  InquirableType,
  IParamDecoratorMetadata,
  isFunction,
  isNil,
  isString,
  ParamFactoryFunction,
  ReactFunction,
  RouteParamType,
} from '@watsonjs/common';
import {
  AwaitMessagesOptions,
  AwaitReactionsOptions,
  CollectorFilter,
  Message,
  MessageEmbed,
  MessageReaction,
  User,
} from 'discord.js';

import { resolveAsyncValue } from '../helpers/resolve-async-value';
import { EventExecutionContext } from '../lifecycle';

export class RouteParamsFactory {
  public async createFromContext(
    paramTypes: IParamDecoratorMetadata[],
    ctx: EventExecutionContext
  ) {
    const data = ctx.getContextData();

    const params: unknown[] = [];
    for (const type of paramTypes) {
      const idx = type.paramIndex;
      switch (type.type) {
        case RouteParamType.EVENT:
          params[idx] = ctx.getEvent();
          break;
        case RouteParamType.CHANNEL:
          params[idx] = (data as CommandContextData).channel;
          break;
        case RouteParamType.CLIENT:
          params[idx] = ctx.getClient();
          break;
        case RouteParamType.CONTEXT:
          params[idx] = ctx;
          break;
        case RouteParamType.GUILD:
          params[idx] = (data as CommandContextData)?.guild;
          break;
        case RouteParamType.MESSAGE:
          params[idx] = data as CommandContextData;
          break;
        case RouteParamType.PARAM:
          const param = type.options;
          if (isNil((data as CommandContextData).params)) {
            params[idx] = undefined;
            break;
          }
          params[idx] = isString(param)
            ? (data as CommandContextData).params[param]
            : (data as CommandContextData).params;
          break;
        case RouteParamType.USER:
          params[idx] = (data as CommandContextData).user;
          break;
        case RouteParamType.FACTORY:
          params[idx] = await this.fromParamFactory(ctx as any, type.factory);
          break;
        case RouteParamType.INQUIRABLE:
          params[idx] = this.fromInquirable(
            ctx as EventExecutionContext<CommandContextData>,
            (type.options as IInquirableMetadata).type
          );
          break;
        default:
          params[idx] = undefined;
      }
    }

    return params;
  }

  private async fromParamFactory(
    ctx: ExecutionContext,
    factory: ParamFactoryFunction
  ) {
    if (isFunction(factory)) {
      return undefined;
    }

    const factoryResult = factory(ctx);
    return resolveAsyncValue(factoryResult);
  }

  private fromInquirable(
    ctx: EventExecutionContext<CommandContextData>,
    type: InquirableType
  ) {
    switch (type) {
      case InquirableType.ASK:
        return this.createAskInquirable(ctx);
      case InquirableType.REACT:
        return this.createReactInquirable(ctx);
      case InquirableType.COLLECT:
        return this.createCollectionInquirable(ctx);
    }
  }

  private createAskInquirable(
    ctx: EventExecutionContext<CommandContextData>
  ): AskFunction {
    const { channel } = ctx.getContextData();
    const askFilter = (message: Message) =>
      message.author.id === ctx.getContextData<CommandContextData>().user.id;

    return async (
      message: string | MessageEmbed,
      options: AwaitMessagesOptions = {}
    ) => {
      await channel.send(message);

      const { time = 10000 } = options;
      const result = await channel.awaitMessages(askFilter, {
        ...options,
        max: 1,
        time: time,
      });

      if (result.size === 0) {
        return undefined;
      }

      return result.first();
    };
  }

  private createReactInquirable(
    ctx: EventExecutionContext<CommandContextData>
  ): ReactFunction {
    const { channel } = ctx.getContextData();

    return async (
      message: string | MessageEmbed,
      options: AwaitReactionsOptions = {},
      customReactionFilter?: CollectorFilter
    ) => {
      const messageRef = await channel.send(message);

      const { time = 10000 } = options;
      const reactionFilter = customReactionFilter
        ? customReactionFilter
        : (reaction: MessageReaction, user: User) =>
            user.id === ctx.getContextData<CommandContextData>().user.id;

      const result = await messageRef.awaitReactions(reactionFilter, {
        ...options,
        time,
      });

      if (result.size === 0) {
        return undefined;
      }

      return result.array();
    };
  }

  private createCollectionInquirable(
    ctx: EventExecutionContext<CommandContextData>
  ): CollectFunction {
    const { channel } = ctx.getContextData();

    return async (
      message: string | MessageEmbed,
      filter: CollectorFilter,
      type,
      options = {}
    ) => {
      const { time = 10000 } = options;
      const messageRef = channel.send(message);

      if (type === "message") {
        const result = await channel.awaitMessages(filter, {
          ...options,
          time,
        });

        return result.array();
      } else if (type === "reaction") {
        const result = await (await messageRef).awaitReactions(filter, {
          ...options,
          time,
        });

        return result.array();
      }
    };
  }
}
