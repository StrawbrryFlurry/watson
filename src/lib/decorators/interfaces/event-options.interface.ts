import { ClientEvents } from 'discord.js';

export interface IEventOptions<T extends keyof ClientEvents> {
  event: T;
}
