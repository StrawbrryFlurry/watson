import { ClientEvents } from 'discord.js';

export class EventRoute<Event extends keyof ClientEvents> {}
