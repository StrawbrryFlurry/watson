import { MessageMatcher, MessageMatchResult } from '@watsonjs/common';
import { Message } from 'discord.js';

import { DynamicPrefixCache } from './dynamic-prefix-cache';

export class TransientDynamicMessageMatcher extends MessageMatcher<DynamicPrefixCache> {
  public match(message: Message): Promise<MessageMatchResult> {
    throw new Error("Method not implemented.");
  }
}
