import { CommandException, CommandParam } from '@watson/common';
import { Message, MessageEmbed } from 'discord.js';
import { EventExecutionContext } from 'event/event-execution-context';

import { CommandParamsFactory, CommandRoute } from '../command';
import { ErrorHost } from '../errors';
import { Logger } from '../logger';
import { CommandExecutionContext } from './execution-context';
import { ResponseParser } from './response-parser';

export class ContextRunner {
  private paramsFactory = new CommandParamsFactory();
  private responseParser = new ResponseParser();
  private errorHost = new ErrorHost();
  private logger = new Logger("ContextRunner");

  public async runCommand(route: CommandRoute, message: Message) {
    const ctx = new CommandExecutionContext(route, message);

    try {
      !ctx.isInitialized && (await ctx.init());
      const args = await this.resolveArguments(ctx);
      const { host, descriptor } = ctx.getContext();
      const responseChannel = ctx.responseChannel;
      const response = descriptor.apply(host.instance, args);
      const clientResponse = await this.responseParser.parse(response);

      if (typeof clientResponse !== "undefined") {
        await responseChannel.send(clientResponse);
      }
    } catch (err) {
      if (err instanceof CommandException) {
        return await this.errorHost.handleCommandException(ctx, err);
      }

      if (err instanceof MessageEmbed) {
        return await this.errorHost.handleMessageEmbedException(ctx, err);
      }

      if (err instanceof Error) {
        return this.logger.log(err.message, "error");
      }

      return this.logger.log(err, "error");
    }
  }

  private async resolveArguments(ctx: CommandExecutionContext) {
    const routeConfig = ctx.getContext();
    const { routeArgs } = routeConfig;

    const args = [];

    for (const argument of routeArgs) {
      if (
        argument.type === CommandParam.FACTORY ||
        typeof argument.factory !== "undefined"
      ) {
        const arg = await this.paramsFactory.resolvePramFactory(
          argument.factory
        );

        args[argument.paramIndex] = arg;
        continue;
      }

      const arg = this.paramsFactory.getParamFromContext(
        ctx,
        argument.type,
        argument.options
      );

      args[argument.paramIndex] = arg;
    }

    return args;
  }

  public async run(ctx: EventExecutionContext<any>, fn: () => Promise<any>) {
    try {
      await fn();
    } catch (ctxException) {}
  }

  private async handleSlashException() {}

  private async handleCommandException(
    ctx: CommandExecutionContext,
    exception: Error
  ) {
    if (exception instanceof CommandException) {
      return await this.errorHost.handleCommandException(ctx, exception);
    }

    if (exception instanceof MessageEmbed) {
      return await this.errorHost.handleMessageEmbedException(ctx, exception);
    }

    if (exception instanceof Error) {
      return this.logger.log(exception.message, "error");
    }
  }

  private async handleEventException() {}
}
