import { ExecutionContext, Injectable, PassThrough } from '@watsonjs/common';
import { Message } from 'discord.js';

@Injectable()
export class GuildMessageFilter implements PassThrough {
  pass(ctx: ExecutionContext) {
    const [message] = ctx.getEvent<Message>();
    const channel = message.channel;

    if (channel.type !== "dm") {
      return true;
    }

    return false;
  }
}
