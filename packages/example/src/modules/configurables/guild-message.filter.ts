import { ExecutionContext, Filter, Injectable } from '@watsonjs/common';

@Injectable()
export class GuildMessageFilter implements Filter {
  filter(ctx: ExecutionContext) {
    const [message] = ctx.getEvent<"message">();
    const channel = message.channel;

    if (channel.type !== "dm") {
      return true;
    }

    return false;
  }
}
