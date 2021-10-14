import { isNil } from '@watsonjs/common';
import { TextChannel } from 'discord.js';

import { ExecutionContextHost } from './execution-context';
import { ResponseParser } from './response-parser';

export class ResponseController {
  private parser = new ResponseParser();

  public async apply<CtxResult = any>(
    ctx: ExecutionContextHost,
    result: CtxResult
  ) {
    const parsed = await this.parser.parse(ctx, result);

    if (isNil(parsed)) {
      return;
    }

    const pipelineHost = ctx.switchToCommand();
    const channel = pipelineHost.getChannel() as TextChannel;
    await channel.send(parsed);

    /**
     * This should mark the context for gc
     */
    ctx._destroy();
    ctx = undefined;
  }
}
