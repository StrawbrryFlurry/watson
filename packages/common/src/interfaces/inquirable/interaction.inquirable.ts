import { MessageSendable } from '@common/interfaces';
import { Message } from 'discord.js';

import { Injectable } from '../..';

/**
 * Reply to an interaction using this
 * function. Note that you can only reply
 * to an interaction once!
 *
 * If you decide you want to react to
 * an Interaction by yourself using
 * this inquirable, Watson will handle
 * the returned value not as a interaction
 * response but as a regular text message
 * to the channel in which the command
 * was used in.
 */
export declare interface ReplyInq {
  (message: MessageSendable): Promise<void>;
}

/**
 * Sends a follow-up message for an interaction
 * as you can only reply to an interaction once.
 */
export declare interface FollowUpInq {
  (message: MessageSendable): Promise<Message>;
}

/**
 * Defers the response to an interaction event.
 * Once a response is deferred, a loading message
 * is shown. You can specify whether the message
 * is only visible to the user or everyone in that
 * channel.
 */
export declare interface DeferReplyInq {
  (ephemeral: boolean): Promise<void>;
}

@Injectable({ providedIn: "ctx" })
export abstract class DeferReplyInq {}

@Injectable({ providedIn: "ctx" })
export abstract class FollowUpInq {}

@Injectable({ providedIn: "ctx" })
export abstract class ReplyInq {}
