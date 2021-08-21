import { IBaseRoute, WatsonEvent } from '@watsonjs/common';
import iterate from 'iterare';

import { ExceptionHandler } from '..';
import { LifecycleFunction } from '../../router';

export abstract class EventProxy<
  Event extends WatsonEvent = WatsonEvent,
  Route extends IBaseRoute = IBaseRoute,
  ProxyType = any
> {
  public readonly eventType: Event;
  public readonly isWSEvent: boolean;
  public readonly handlers = new Map<
    Route,
    [LifecycleFunction, ExceptionHandler]
  >();

  constructor(type: Event, isWSEvent: boolean = false) {
    this.eventType = type;
    this.isWSEvent = isWSEvent;
  }

  public abstract proxy(args: ProxyType): Promise<void>;

  public abstract bind(
    route: IBaseRoute,
    eventHandler: LifecycleFunction,
    exceptionHandler: ExceptionHandler
  ): void;

  public getHandlerFns() {
    return iterate(this.handlers).toArray();
  }
}
