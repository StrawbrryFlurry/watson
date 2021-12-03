import { Injectable } from '@common/injectable';
import { MessageSendable } from '@common/interfaces';
import { ChannelResolvable, Guild, Message } from 'discord.js';

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
  (message: MessageSendable): Promise<Message>;
  (message: MessageSendable, channel?: ChannelResolvable): Promise<Message>;
  (
    message: MessageSendable,
    channel?: ChannelResolvable,
    guild?: Guild
  ): Promise<Message>;
}

@Injectable({ providedIn: "ctx" })
export abstract class SendInq {}
