import { CommandContextData, isNil } from '@watsonjs/common';

import { EventExecutionContext } from './event-execution-context';
import { ResponseParser } from './response-parser';

export class ResponseController {
  private parser = new ResponseParser();

  public async apply<CtxResult = any>(
    ctx: EventExecutionContext,
    result: CtxResult
  ) {
    const parsed = await this.parser.parse(ctx, result);

    if (isNil(parsed)) {
      return;
    }

    const { channel } = ctx.getContextData<CommandContextData>();
    await channel.send(parsed);

    // The context should not be usable after the command or event has been executed.
    ctx = undefined;
  }
}
