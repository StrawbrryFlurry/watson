export enum MatchingStrategy {
  /**
   * The static matching strategy doesn't
   * support dynamic prefixes and is the
   * best option for small bots or test
   * projects that don't require much
   * customizability.
   */
  Static,
  /**
   * In contrast to the static matching
   * strategy, this one does support
   * dynamic prefixes, as the name suggests.
   *
   * All prefixes will be resolved when a
   * command is run which might not be optimal
   * depending on the amount of dynamic prefixes
   * you have and how much traffic the guilds of
   * your bot receives.
   */
  Dynamic,
  /**
   * This strategy is meant for bots
   * that allow for a lot of customizability
   * by the user with as much of a performance
   * boost as we can get for a large number of
   * different prefixes or keywords.
   *
   * Note that this matching strategy will only
   * benefit you if your bot has a lot of different
   * prefixes and keywords that it is supposed
   * to respond to. Otherwise this strategy will
   * likely be slower than some of the other options.
   */
  DynamicCached,
  /**
   * The Scoped matching strategy
   * caches prefixes in a guild - prefix
   * map for faster message matching.
   *
   * The cache is updated periodically,
   * after a command was run.
   *
   * Use this strategy if your guilds only
   * have one dynamic prefix or a static one.
   */
  Scoped,
  /**
   * Provide a custom command matcher
   * to fit your needs and optimize it
   * for your app. A command matcher
   * extends the `MessageMatcher` class.
   * See the docs for more info.
   */
  Custom,
}
