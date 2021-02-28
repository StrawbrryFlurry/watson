import {
  AskFunction,
  CollectFunction,
  ExecutionContext,
  IInquirableMetadata,
  InquirableType,
  IParamDecoratorMetadata,
  isFunction,
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
  TextChannel,
  User,
} from 'discord.js';

import { CommandPipelineHost } from '../command';
import { resolveAsyncValue } from '../helpers/resolve-async-value';
import { ExecutionContextHost } from '../lifecycle';

export class RouteParamsFactory {
  public async createFromContext(
    paramTypes: IParamDecoratorMetadata[],
    ctx: ExecutionContextHost
  ) {
    const commandPipe = ctx.switchToCommand();

    const params: unknown[] = [];
    for (const type of paramTypes) {
      const idx = type.paramIndex;
      switch (type.type) {
        case RouteParamType.EVENT:
          params[idx] = ctx.getEvent();
          break;
        case RouteParamType.CHANNEL:
          params[idx] = commandPipe.getChannel();
          break;
        case RouteParamType.CLIENT:
          params[idx] = ctx.getClient();
          break;
        case RouteParamType.CONTEXT:
          params[idx] = ctx;
          break;
        case RouteParamType.GUILD:
          params[idx] = commandPipe.getGuild();
          break;
        case RouteParamType.MESSAGE:
          params[idx] = commandPipe.getMessage();
          break;
        case RouteParamType.PARAM:
          const param = type.options;
          const argumentsHost = commandPipe.getArguments();

          if (argumentsHost.arguments.length === 0) {
            params[idx] = undefined;
            break;
          }

          params[idx] = isString(param)
            ? argumentsHost.getParamByName(param)
            : argumentsHost.arguments;
          break;
        case RouteParamType.USER:
          params[idx] = commandPipe.getUser();
          break;
        case RouteParamType.FACTORY:
          params[idx] = await this.fromParamFactory(ctx as any, type.factory);
          break;
        case RouteParamType.INQUIRABLE:
          params[idx] = this.fromInquirable(
            commandPipe,
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

  private fromInquirable(pipe: CommandPipelineHost, type: InquirableType) {
    switch (type) {
      case InquirableType.ASK:
        return this.createAskInquirable(pipe);
      case InquirableType.REACT:
        return this.createReactInquirable(pipe);
      case InquirableType.COLLECT:
        return this.createCollectionInquirable(pipe);
    }
  }

  private createAskInquirable(pipe: CommandPipelineHost): AskFunction {
    const channel = pipe.getChannel() as TextChannel;
    const askFilter = (message: Message) => message.author.id === pipe.user.id;

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

  private createReactInquirable(pipe: CommandPipelineHost): ReactFunction {
    const channel = pipe.getChannel() as TextChannel;

    return async (
      message: string | MessageEmbed,
      options: AwaitReactionsOptions = {},
      customReactionFilter?: CollectorFilter
    ) => {
      const messageRef = await channel.send(message);

      const { time = 10000 } = options;
      const reactionFilter = customReactionFilter
        ? customReactionFilter
        : (reaction: MessageReaction, user: User) => user.id === pipe.user.id;

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
    pipe: CommandPipelineHost
  ): CollectFunction {
    const { channel } = pipe;

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
