import { resolveAsyncValue } from '@watsonjs/core';
import { Message } from 'discord.js';
import { Prefix } from 'packages/common/src/interfaces';
import { isNil } from 'packages/common/src/utils';

/**
 * Caches the prefix for all guilds
 * and the global prefix
 *
 * @key The resolved prefix
 * @value The prefix that the value belongs to
 */
export class PrefixCache extends Map<string, Prefix> {
  private _prefixes: Prefix[] = [];

  constructor() {
    super();
  }

  /** Resolves the prefix for a message */
  public resolve(message: Message): string | null {
    const key = this.getCacheKey(message);
    const prefix = this.get(key);

    if (prefix) {
      return prefix;
    }

    return null;
  }

  /**
   * Resolves all prefixes for a given message
   *
   * This method is called if the matcher cannot
   * find a prefix for a specific guild / globally
   */
  public async tryResolve(message: Message): Promise<string | null> {
    const key = this.getCacheKey(message);
    const prefix = this.get(key);

    if (!isNil(prefix)) {
      return prefix;
    }

    await this.syncAll(message);
    return this.get(key);
  }

  /**
   * Returns an update function that can be called
   * later in the pipeline to update a guild prefix
   */
  public async queueResync(message: Message) {
    const key = this.getCacheKey(message);

    return async (prefixRef: Prefix) => {
      const { prefix, resolve } = prefixRef;

      if (prefix) {
        return this.set(key, prefix);
      }

      const resolved = await resolveAsyncValue(resolve(message));
      this.set(key, resolved);
    };
  }

  /**
   * If you want to allow your users to be able
   * to update the prefix use this method to
   * immediately update the prefix in the cache.
   */
  public async requestResyncFor(
    message: Message,
    prefixRef: Prefix
  ): Promise<void> {
    const key = this.getCacheKey(message);
    const { prefix, resolve } = prefixRef;
    const current = this.get(key);

    if (current === prefix) {
      return;
    }

    const newPrefix = await resolveAsyncValue(resolve(message));
    const prefixIdx = this.prefixes.indexOf(prefix);
    this.prefixes.splice(prefixIdx, prefixIdx + 1);

    if (this.prefixes.includes(newPrefix)) {
      this.set(key, newPrefix);
      return;
    }
  }

  /**
   * Class the internal resync method.
   * Intentionally doesn't return the promise
   * to make sure this process isn't awaited
   * by accident. If you really really need
   * the complete resync to happen and await
   * it use the private `syncAll` method.
   */
  public requestResync(message: Message) {
    this.syncAll(message);
  }

  /** Adds a new prefix to the cache */
  public applyPrefix(prefix: Prefix) {
    this._prefixes.push(prefix);
  }

  private async syncAll(message: Message) {
    const newPrefixes = [];

    for (let i = 0; i < this._prefixes.length; i++) {
      const prefixRef = this._prefixes[i];
      let { prefix } = prefixRef;

      const key = this.getCacheKey(message);

      if (prefix) {
        this.set(key, prefix);
        newPrefixes.push(prefix);
        continue;
      }

      const { resolve } = prefixRef;
      prefix = await resolveAsyncValue(resolve(message));

      if (!isNil(prefix)) {
        this.set(key, prefix);

        if (!this.prefixes.includes(prefix)) {
          newPrefixes.push(prefix);
        }
      }
    }

    this.prefixes = newPrefixes;
  }
}
