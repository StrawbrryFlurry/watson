import { MessageMatcher, Prefix } from '@watsonjs/common';
import { Message } from 'discord.js';

import { PrefixCache } from './__prefix-cache';

export class MessageMatcherImpl implements MessageMatcher {
  private _cache: PrefixCache;

  constructor(cache: PrefixCache) {
    this._cache = cache;
  }

  public async shouldMatch(
    message: Message,
    findBest: boolean = false
  ): Promise<Prefix | null> {
    const key = this._cache.getCacheKey(message);

    return null;
  }

  public resyncPrefixCache(): void {}
}
