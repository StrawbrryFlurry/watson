import { DIProvided } from '@common/di';
import { MessageSendable } from '@common/interfaces';

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
export declare interface InteractionReply {
  (message: MessageSendable): Promise<void>;
}

export abstract class InteractionReply extends DIProvided({
  providedIn: "ctx",
}) {}
