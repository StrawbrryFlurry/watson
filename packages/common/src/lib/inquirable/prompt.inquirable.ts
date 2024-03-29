import { MessageSendable } from '@common/discord-types';
import { Injectable } from '@watsonjs/di';
import { Message } from 'discord.js';

/**
 * @param message The prompt message to be sent
 * @returns A `Promise` that resolves to the response of the user
 * in the same channel as the command originated.
 * Resolves to `undefined` if the timeout has exceeded.
 */
export declare interface PromptInq {
  (message: MessageSendable): Promise<Message | null>;
}

@Injectable({ providedIn: "ctx" })
export abstract class PromptInq {}
