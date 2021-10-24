import { MessageMatcher, MessageMatchResult, Prefix } from '@watsonjs/common';
import { Message } from 'discord.js';
import { MatchingStrategy } from 'packages/common/src/interfaces/command/matcher/matching-strategy.enum';

import { StaticPrefixCache } from './static-prefix-cache';

export class StaticMessageMatcher extends MessageMatcher<StaticPrefixCache> {
  constructor(prefixes: Prefix[]) {
    super(MatchingStrategy.Static, new StaticPrefixCache(prefixes));
  }

  public async match(message: Message): Promise<MessageMatchResult | null> {
    const prefixes = this._cache.prefixes;
    const { content } = message;

    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i];

      if (content.indexOf(prefix) !== 0) {
        continue;
      }

      const prefixRef = this._cache.get(prefix)!;

      return {
        prefix: prefixRef,
        prefixString: prefix,
      };
    }

    return null;
  }
}
