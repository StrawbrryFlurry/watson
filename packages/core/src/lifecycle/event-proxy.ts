import { WatsonEvent } from '@watsonjs/common';
import iterate from 'iterare';

import { DiscordJSAdapter } from '../adapters';
import { ExceptionHandler } from '../lifecycle';
import { IHandlerFunction } from '../routes';

export class EventProxy<Event extends WatsonEvent> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlerFunctions = new Map<
    IHandlerFunction,
    ExceptionHandler
  >();

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public async proxy(
    adapter: DiscordJSAdapter,
    args: unknown[]
  ): Promise<void> {
    Promise.all(
      this.getHandlerFns().map(async ([eventHandler, excpetionHandler]) => {
        try {
          await eventHandler(adapter, args);
        } catch (err) {
          excpetionHandler.handle(err);
        }
      })
    );
  }

  public bind(
    eventHandler: IHandlerFunction,
    exceptionHandler: ExceptionHandler
  ) {
    this.handlerFunctions.set(eventHandler, exceptionHandler);
  }

  public getHandlerFns() {
    return iterate(this.handlerFunctions).toArray();
  }
}
