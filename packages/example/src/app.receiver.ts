import { Command, Event, InjectEvent, Receiver } from '@watsonjs/common';
import { TokenizerContext } from '@watsonjs/core';
import { Message } from 'discord.js';

import { AppService } from './app.service';

@Receiver()
export class AppReceiver {
  constructor(private readonly appService: AppService) {}

  @Command("ping")
  ping() {
    return this.appService.ping();
  }

  @Event("message")
  handle(@InjectEvent() [e]: [Message]) {
    const { content } = e;
    const tokenizer = new TokenizerContext(content);
    const s = tokenizer.tokenize();
    console.log(s.tokens);
  }
}
