import { MessageEmbed, MessageReaction, User } from 'discord.js';
import { InquirableType } from 'enums';

import { createInquirableDecorator } from './create-inquirable-decorator';

export interface IReactOptions {}

/**
 * @param message The message or message embed to send.
 * @param options Configurable options for the listener.
 * @returns A `Promise` that resolves to the reaction of the user on the message sent.
 * Resolves to `undefined` if the timeout has exceeded
 */
export type ReactFunction<T = any> = (
  message: string | MessageEmbed,
  options?: IReactOptions,
  customReactionFilter?: (reaction: MessageReaction, user: User) => boolean
) => Promise<T>;

/**
 * Injects the `react` function to the command handler.
 */
export function React() {
  return createInquirableDecorator(InquirableType.REACT);
}
