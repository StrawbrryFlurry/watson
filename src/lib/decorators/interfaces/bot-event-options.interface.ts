import { ClientEvents } from 'discord.js';

export interface IBotEventOptions {
  event: keyof ClientEvents;
}
