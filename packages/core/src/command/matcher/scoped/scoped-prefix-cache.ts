import { resolveAsyncValue } from '@core/utils';
import { isNil, Prefix, PrefixCache } from '@watsonjs/common';
import { Message } from 'discord.js';

export interface ScopedPrefixCacheData {
  prefix: Prefix;
  resolvedPrefix: string;
}

export const DEFAULT_SCOPED_CACHE_KEY = Symbol("ScopedPrefixCacheKey");

export class ScopedPrefixCache extends PrefixCache<
  string | Symbol,
  ScopedPrefixCacheData
> {
  private _prefixes: Prefix[];

  constructor(prefixes: Prefix[]) {
    super();
    this._prefixes = prefixes;
  }

  public applyPrefix(...prefixes: Prefix[]) {
    this._prefixes.push(...prefixes);
  }

  public async resyncFor(message: Message): Promise<void> {
    const key = this.getCacheKey(message);
    const prefixes = this._prefixes;

    for (let i = 0; i < prefixes.length; i++) {
      const prefixRef = prefixes[i];
      const { prefix, resolve } = prefixRef;

      if (!isNil(prefix)) {
        this.set(key, { prefix: prefixRef, resolvedPrefix: prefix });
        return;
      }

      const result = await resolveAsyncValue(resolve(message));

      if (result) {
        this.set(key, {
          prefix: prefixRef,
          resolvedPrefix: result,
        });
        return;
      }
    }

    // TODO: Throw an error of no new prefix was found?
  }

  /**
   * Returns the guild id of the message
   * if there is one. If not returns
   * {@link DEFAULT_SCOPED_CACHE_KEY}
   */
  public getCacheKey(message: Message): Symbol | string {
    const { guild } = message;

    if (isNil(message.guild)) {
      return DEFAULT_SCOPED_CACHE_KEY;
    } else {
      return guild.id;
    }
  }
}
