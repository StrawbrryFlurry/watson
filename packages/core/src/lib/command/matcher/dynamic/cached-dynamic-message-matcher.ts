import { MessageMatcher, MessageMatchResult } from '@watsonjs/common';
import { Message } from 'discord.js';

export class CachedDynamicMessageMatcher extends MessageMatcher<any> {
  public match(message: Message): Promise<MessageMatchResult | null> {
    throw new Error("Method not implemented.");
  }
}
