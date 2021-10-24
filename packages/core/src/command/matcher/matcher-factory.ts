import { Injector, NOT_FOUND } from '@core/di';
import { MatchingStrategy, MessageMatcher, PrefixCache } from '@watsonjs/common';

import { CachedDynamicMessageMatcher, TransientDynamicMessageMatcher } from '.';
import { GuildScopedMessageMatcher } from './scoped';
import { StaticMessageMatcher } from './static';

export class MessageMatcherFactory {
  static async create<T extends PrefixCache = any>(
    injector: Injector,
    strategy: MatchingStrategy = MatchingStrategy.Static
  ): Promise<MessageMatcher<T>> {
    let matcher: any;
    let arg: any; // TODO:
    switch (strategy) {
      case MatchingStrategy.Static:
        matcher = new StaticMessageMatcher(arg) as any as MessageMatcher<T>;
        break;
      case MatchingStrategy.Scoped:
        matcher = new GuildScopedMessageMatcher(
          arg
        ) as any as MessageMatcher<T>;
        break;
      case MatchingStrategy.Dynamic:
        matcher = new TransientDynamicMessageMatcher(
          1,
          arg
        ) as any as MessageMatcher<T>;
        break;
      case MatchingStrategy.DynamicCached:
        matcher = new CachedDynamicMessageMatcher(
          1,
          arg
        ) as any as MessageMatcher<T>;
        break;
      case MatchingStrategy.Custom:
        {
          matcher = await injector.get(MessageMatcher, NOT_FOUND);

          if (matcher === NOT_FOUND) {
            throw "Could not find a message matcher for custom strategy";
          }
        }
        break;
    }

    return matcher as MessageMatcher<T>;
  }
}
