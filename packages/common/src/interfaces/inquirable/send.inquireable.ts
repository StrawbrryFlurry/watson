import { DIProvided } from '@common/di';
import { MessageSendable } from '@common/interfaces';
import { ChannelResolvable, GuildResolvable } from 'discord.js';

/**
 * Sends a message to the channel that
 * the initial event was emitted from.
 *
 * Additionally, you can specify different
 * channels or channels in other guilds that
 * the message will be sent to.
 *
 * Equivalent to `channel.send(/ ...Args /*)`
 */
export declare interface SendInq {
  (message: MessageSendable): Promise<void>;
  (message: MessageSendable, channel?: ChannelResolvable): Promise<void>;
  (
    message: MessageSendable,
    channel?: ChannelResolvable,
    guild?: GuildResolvable
  ): Promise<void>;
}

export abstract class SendInq extends DIProvided({ providedIn: "ctx" }) {}
