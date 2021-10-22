import { DIProvided } from '@common/interfaces';
import { Channel, Client, Guild, Message, VoiceChannel } from 'discord.js';

/**
 * Injects the channel that the
 * event was emitted from.
 */
export abstract class ChannelCtx extends DIProvided(
  { providedIn: "ctx" },
  Channel
) {}

/**
 * Injects the voice channel
 * that the user, who has used the command
 * is in.
 */
export abstract class VoiceChannelCtx extends DIProvided(
  { providedIn: "ctx" },
  VoiceChannel
) {}

/**
 * Injects the message that emitted
 * the event
 */
export abstract class MessageCtx extends DIProvided(
  { providedIn: "ctx" },
  Message
) {}

/**
 * Injects the discord client from
 * which the event was emitted.
 *
 * Will be `null` if the event wasn't
 * emitted from a guild.
 */
export abstract class GuildCtx extends DIProvided(
  { providedIn: "ctx" },
  Guild
) {}

/**
 * Injects the discord client from
 * which the event was emitted.
 */
export abstract class ClientCtx extends DIProvided(
  { providedIn: "ctx" },
  Client
) {}
