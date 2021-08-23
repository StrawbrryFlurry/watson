import { isNil, MessageMatcher, MessageMatcherType, MessageMatchResult, Prefix } from '@watsonjs/common';
import { Message } from 'discord.js';

import { DEFAULT_SCOPED_CACHE_KEY } from '.';
import { ScopedPrefixCache } from './scoped-prefix-cache';

export class GuildScopedMessageMatcher extends MessageMatcher<ScopedPrefixCache> {
  constructor(prefixes: Prefix[]) {
    super(
      MessageMatcherType.GuildScopedMessageMatcher,
      new ScopedPrefixCache(prefixes)
    );
  }

  public async match(message: Message): Promise<MessageMatchResult> {
    const key = this._cache.getCacheKey(message);
    const content = this.toNormalizedContent(message);
    let { prefix, resolvedPrefix } = this._cache.get(key);

    const checkContent = (prefix: Prefix, resolvedPrefix: string) => {
      if (content.indexOf(resolvedPrefix) !== 0) {
        return null;
      }

      return {
        prefix: prefix,
        prefixString: resolvedPrefix,
      };
    };

    if (isNil(resolvedPrefix)) {
      await this._cache.resyncFor(message);
      const { prefix, resolvedPrefix } = this._cache.get(key);

      if (isNil(resolvedPrefix) && key === DEFAULT_SCOPED_CACHE_KEY) {
        // TODO: Maybe throw an error if
        // no prefix can be found
        return null;
      } else if (isNil(resolvedPrefix)) {
        const { prefix, resolvedPrefix } = this._cache.get(key);

        if (isNil(resolvedPrefix)) {
          // TODO: Maybe throw an error if
          // no prefix can be found
          return null;
        }

        return checkContent(prefix, resolvedPrefix);
      }

      return checkContent(prefix, resolvedPrefix);
    }

    return checkContent(prefix, resolvedPrefix);
  }
}
