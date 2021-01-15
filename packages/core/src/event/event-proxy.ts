import { IClientEvent } from '@watson/common';
import { ClientEvents } from 'discord.js';
import iterate from 'iterare';
import { IHandlerFunction } from 'routes';

export abstract class EventProxy<Event extends IClientEvent> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlerFunctions: Set<IHandlerFunction<any>>;

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public abstract proxy(...args: ClientEvents[Event]): void;

  public bind(factory: IHandlerFunction<any>) {
    this.handlerFunctions.add(factory);
  }

  protected getHandlerFns() {
    return iterate(this.handlerFunctions).toArray();
  }
}
