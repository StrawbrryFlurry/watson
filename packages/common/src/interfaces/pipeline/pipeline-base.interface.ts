import { Guild, GuildChannel, TextChannel } from 'discord.js';

import { BaseRoute, ContextType } from '..';

export interface PipelineWithGuildCtx {
  guild: Guild;
  channel: GuildChannel & TextChannel;
}

export interface PipelineBase<
  D extends unknown = any,
  T extends BaseRoute = any
> {
  /** The Watson pipeline type */
  contextType: ContextType;
  /**
   * The route that matched with
   * the event emitted.
   */
  route: T;
  /** The raw event data emitted by the client */
  eventData: D;
  /**
   * Returns the raw data emitted by the
   * client.
   *
   * ```
   * client.on("message", (\/* "Event Data" *\/) => {})
   * ```
   */
  getEvent(): D;
  /**
   * Whether the message is from a guild or not
   */
  isFromGuild(): this is PipelineBase & PipelineWithGuildCtx;
  /**
   * Returns the context injector of
   * this pipeline context.
   */
  getInjector<T = any>(): T;
}
