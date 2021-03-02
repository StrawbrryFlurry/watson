import { BaseRoute, WatsonEvent } from '@watsonjs/common';
import { Base } from 'discord.js';
import iterate from 'iterare';

import { ExceptionHandler } from '../lifecycle';
import { TLifecycleFunction } from '../router';

export abstract class EventProxy<
  Event extends WatsonEvent = WatsonEvent,
  Route extends BaseRoute = BaseRoute
> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlers = new Map<
    Route,
    [TLifecycleFunction, ExceptionHandler]
  >();

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public abstract proxy(args: Base[]): Promise<void>;

  /**
   * Promise.all(
      this.getHandlerFns().map(async ([eventHandler, excpetionHandler]) => {
        try {
          await eventHandler(routeRef, event);
        } catch (err) {
          excpetionHandler.handle(err);
        }
      })
    );
  */
  public abstract bind(
    route: BaseRoute,
    eventHandler: TLifecycleFunction,
    exceptionHandler: ExceptionHandler
  ): void;

  public getHandlerFns() {
    return iterate(this.handlers).toArray();
  }
}
