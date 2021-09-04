import { MessageSendable } from '@interfaces';
import { AwaitMessagesOptions, Message } from 'discord.js';

/**
 * @param message The prompt message to be sent
 * @param collectorOptions Configurable options for the collector.
 * @returns A `Promise` that resolves to the response of the user in the same channel as the command originated.
 * Resolves to `undefined` if the timeout has exceeded.
 */
export declare interface PromptInq<T extends Message | Message[]> {
  (
    message: MessageSendable,
    collectorOptions?: AwaitMessagesOptions
  ): Promise<T>;
}

export abstract class PromptInq<T extends Message | Message[] = Message> {}
