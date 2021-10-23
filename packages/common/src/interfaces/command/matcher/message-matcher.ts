import { DIProvided, Prefix, PrefixCache } from '@common/interfaces';
import { Message } from 'discord.js';

import { MatchingStrategy } from './matching-strategy.enum';

export interface MessageMatchResult {
  prefix: Prefix;
  prefixString: string;
}

/**
 * A message matcher makes sure that a
 * given message event that was dispatched
 * by the client is relevant to the framework.
 *
 * This is done by checking the message content
 * for a prefix defined in it's {@link PrefixCache}.
 * (May vary on the implementation.
 * This is how we do it by default)
 */
export abstract class MessageMatcher<
  Cache extends PrefixCache
> extends DIProvided({ providedIn: "root" }) {
  protected _cache: Cache;

  /**
   * The type of the message matcher
   * Known types are:
   * - StaticMessageMatcher (0)
   * - TransientDynamicMessageMatcher (1)
   * - CachedDynamicMessageMatcher (2)
   * - GuildScopedMessageMatcher (3)
   * - Custom (4)
   */
  public get type(): MatchingStrategy {
    return this._type;
  }
  private _type: number;

  /**
   * A derived class will be instantiated
   * with an array of prefixes for the cache.
   */
  constructor(type: number, cache: Cache) {
    super();
    this._type = type;
    this._cache = cache;
  }

  /**
   * Matches `message` with it's internal prefix cache
   * if a prefix match is found, the first one is returned.
   */
  public abstract match(message: Message): Promise<MessageMatchResult | null>;

  /**
   * Returns a normalized version of
   * the message content that can be matched with
   * a prefix. Later, the parser will worry
   * about the proper capitalization of the
   * prefix.
   */
  protected toNormalizedContent(message: Message) {
    let { content } = message;
    return content.trim().toLowerCase();
  }
}
