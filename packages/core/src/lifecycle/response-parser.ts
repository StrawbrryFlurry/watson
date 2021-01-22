import { isNil, isString } from '@watsonjs/common';
import { MessageEmbed } from 'discord.js';

import { NotParsableException } from '../exceptions/not-parsable.exception';
import { AsyncContextResolver } from './async-context-resolver';
import { EventExecutionContext } from './event-execution-context';

export type ICommandResponse<T = any> = undefined | T[] | T;

export class ResponseParser {
  private asyncResolver = new AsyncContextResolver();

  public async parse(
    ctx: EventExecutionContext,
    commandData: ICommandResponse
  ) {
    if (isNil(commandData)) {
      return;
    }

    if (!(ctx.getType() === "command")) {
      return;
    }

    if (!this.isSendableMessage(commandData)) {
      return;
      // Might be annoying for returning `channel.send`
      throw new NotParsableException(commandData, ctx);
    }

    return commandData;
  }

  private isSendableMessage(message: unknown) {
    return (
      isString(message) ||
      typeof message === "number" ||
      typeof message === "boolean" ||
      typeof message === "bigint" ||
      message instanceof MessageEmbed
    );
  }
}
