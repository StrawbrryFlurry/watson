import { AwaitMessagesOptions, MessageEmbed } from 'discord.js';

/**
 * @param message The message or message embed to send.
 * @param collectorOptions Configurable options for the collector.
 * @returns A `Promise` that resolves to the response of the user in the same channel as the command originated.
 * Resolves to `undefined` if the timeout has exceeded
 */
export type AskFunction<T = any> = (
  message: string | MessageEmbed,
  collectorOptions?: AwaitMessagesOptions
) => Promise<T>;

/**
 * Injects the `ask` function to the command handler.
 */
export function InjectAsk() {
  // return createInquirableDecorator(InquirableType.ASK);
}
