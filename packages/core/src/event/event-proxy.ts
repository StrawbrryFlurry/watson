import { IClientEvent } from '@watson/common';
import { ClientEvents } from 'discord.js';

export abstract class EventProxy<Event extends IClientEvent> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public abstract proxy(...args: ClientEvents[Event]): void;
}
