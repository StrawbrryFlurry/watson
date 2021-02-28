import { WatsonEvent } from '@watsonjs/common';
import { Base } from 'discord.js';
import iterate from 'iterare';

import { ExceptionHandler } from '../lifecycle';
import { TLifecycleFunction } from '../router';

export class EventProxy<Event extends WatsonEvent> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlerFunctions = new Map<
    TLifecycleFunction,
    ExceptionHandler
  >();

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public async proxy(args: Base[]): Promise<void> {
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
    eventHandler: TLifecycleFunction,
    exceptionHandler: ExceptionHandler
  ) {
    this.handlerFunctions.set(eventHandler, exceptionHandler);
  }

  public getHandlerFns() {
    return iterate(this.handlerFunctions).toArray();
  }
}
