import { Channel, Client, Guild, Message, VoiceChannel } from 'discord.js';
import { WATSON_ELEMENT_ID } from 'packages/common/src/fields';

/**
 * Injects the channel that the
 * event was emitted from.
 */
export abstract class ChannelCtx extends Channel {
  static [WATSON_ELEMENT_ID] = -1;
}

/**
 * Injects the voice channel
 * that the user, who has used the command
 * is in.
 */
export abstract class VoiceChannelCtx extends VoiceChannel {
  static [WATSON_ELEMENT_ID] = -1;
}

/**
 * Injects the message that emitted
 * the event
 */
export abstract class MessageCtx extends Message {
  static [WATSON_ELEMENT_ID] = -1;
}

/**
 * Injects the discord client from
 * which the event was emitted.
 *
 * Will be `null` if the event wasn't
 * emitted from a guild.
 */
export abstract class GuildCtx extends Guild {
  static [WATSON_ELEMENT_ID] = -1;
}

/**
 * Injects the discord client from
 * which the event was emitted.
 */
export abstract class ClientCtx extends Client {
  static [WATSON_ELEMENT_ID] = -1;
}
