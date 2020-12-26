import { ClientEvents } from 'discord.js';

export abstract class EventProxy<Event extends keyof ClientEvents> {
  public readonly eventType: Event;

  constructor(type: Event) {
    this.eventType = type;
  }

  public abstract proxy(...args: ClientEvents[Event]): void;
}
