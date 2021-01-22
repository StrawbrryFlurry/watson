import { EventExceptionHandler, Injectable } from '@watsonjs/common';
import { Message } from 'discord.js';

import { CustomException } from './custom.exception';

@Injectable()
export class CustomExceptionHandler extends EventExceptionHandler {
  constructor() {
    super(CustomException);
  }

  async catch(err: CustomException) {
    const { data, context } = err;
    const { message } = context.getEventObj() as { message: Message };

    await message.channel.send(data);
  }
}
