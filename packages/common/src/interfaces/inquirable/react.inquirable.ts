import { AwaitMessagesOptions, MessageEmbed, MessageReaction, User } from 'discord.js';

// TODO: #10

/**
 * @param message The message or message embed to send.
 * @param options Configurable options for the listener.
 * @returns A `Promise` that resolves to the reaction of the user on the message sent.
 * Resolves to `undefined` if the timeout has exceeded
 */
export type ReactFunction<T = any> = (
  message: string | MessageEmbed,
  options?: AwaitMessagesOptions,
  customReactionFilter?: (reaction: MessageReaction, user: User) => boolean
) => Promise<T>;

/**
 * Injects the `react` function to the command handler.
 */
export function InjectReact() {
  // return createInquirableDecorator(InquirableType.REACT);
}
