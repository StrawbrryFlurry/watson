import { ExecutionContext, isNil } from '@watsonjs/common';
import { TextChannel } from 'discord.js';

import { ResponseParser } from './response-parser';

export class ResponseController {
  private parser = new ResponseParser();

  public async apply<CtxResult = any>(
    ctx: ExecutionContext,
    result: CtxResult
  ) {
    const parsed = await this.parser.parse(ctx, result);

    if (isNil(parsed)) {
      return;
    }

    const pipelineHost = ctx.switchToCommand();
    const channel = pipelineHost.getChannel() as TextChannel;
    await channel.send(parsed);
  }
}
