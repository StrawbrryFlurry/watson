import { IClientEvent } from '@watson/common';
import { ClientEvents } from 'discord.js';
import iterate from 'iterare';
import { ExceptionHandler } from 'lifecycle';
import { IHandlerFunction } from 'routes';

export class EventProxy<Event extends IClientEvent> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlerFunctions: Map<
    IHandlerFunction<any>,
    ExceptionHandler
  >;

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public async proxy(...args: ClientEvents[Event]): Promise<void> {
    Promise.all(
      this.getHandlerFns().map(async ([eventHandler, excpetionHandler]) => {
        try {
          await eventHandler(args);
        } catch (err) {
          excpetionHandler.handle(err);
        }
      })
    );
  }

  public bind(
    eventHandler: IHandlerFunction<any>,
    exceptionHandler: ExceptionHandler
  ) {
    this.handlerFunctions.set(eventHandler, exceptionHandler);
  }

  protected getHandlerFns() {
    return iterate(this.handlerFunctions).toArray();
  }
}
