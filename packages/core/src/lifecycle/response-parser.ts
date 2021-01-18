import { isString } from 'class-validator';
import { MessageEmbed } from 'discord.js';
import { RuntimeException } from 'exceptions';

import { AsyncContextResolver } from './async-context-resolver';
import { EventExecutionContext } from './event-execution-context';

export type ICommandResponse<T = any> = undefined | T[] | T;

export class ResponseParser {
  private asyncResolver = new AsyncContextResolver();

  public async parse(
    ctx: EventExecutionContext,
    commandData: ICommandResponse
  ) {
    if (typeof commandData === "undefined") {
      return;
    }

    if (!(ctx.getType() === "command")) {
      throw new RuntimeException(
        "Cannot return from an event listener that is not a command. Use an returnable instead to resolve this issue."
      );
    }

    return this.asyncResolver.resolveAsyncValue(commandData);
  }

  private isSendableMessage(message: unknown) {
    return (
      isString(message) ||
      typeof message === "number" ||
      message instanceof MessageEmbed
    );
  }

  private isReturnable(result: unknown) {}
}
