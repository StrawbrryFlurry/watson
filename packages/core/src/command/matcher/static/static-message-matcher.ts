import { MessageMatcher, MessageMatcherType, MessageMatchResult, Prefix } from '@watsonjs/common';
import { Message } from 'discord.js';

import { StaticPrefixCache } from './static-prefix-cache';

export class StaticMessageMatcher extends MessageMatcher<StaticPrefixCache> {
  constructor(prefixes: Prefix[]) {
    super(
      MessageMatcherType.StaticMessageMatcher,
      new StaticPrefixCache(prefixes)
    );
  }

  public async match(message: Message): Promise<MessageMatchResult> {
    const prefixes = this._cache.prefixes;
    const { content } = message;

    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];

      if (content.indexOf(prefix) !== 0) {
        continue;
      }

      const prefixRef = this._cache.get(prefix);

      return {
        prefix: prefixRef,
        prefixString: prefix,
      };
    }

    return null;
  }
}
