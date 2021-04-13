import { BaseRoute, WatsonEvent } from '@watsonjs/common';
import iterate from 'iterare';

import { ExceptionHandler } from '..';
import { TLifecycleFunction } from '../../router';

export abstract class EventProxy<
  Event extends WatsonEvent = WatsonEvent,
  Route extends BaseRoute = BaseRoute,
  ProxyType = any
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

  public abstract proxy(args: ProxyType): Promise<void>;

  public abstract bind(
    route: BaseRoute,
    eventHandler: TLifecycleFunction,
    exceptionHandler: ExceptionHandler
  ): void;

  public getHandlerFns() {
    return iterate(this.handlers).toArray();
  }
}
