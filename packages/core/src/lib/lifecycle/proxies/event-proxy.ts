import { LifecycleFunction } from '@core/router';
import { BaseRoute, WatsonEvent } from '@watsonjs/common';

import { AbstractProxy } from './abstract-proxy';

export class EventProxy<
  Event extends WatsonEvent = WatsonEvent,
  Route extends BaseRoute = BaseRoute
> extends AbstractProxy<Event, Route> {
  constructor(event: Event) {
    super(event, false);
  }

  public proxy(args: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public bind(route: BaseRoute, eventHandler: LifecycleFunction): void {
    throw new Error("Method not implemented.");
  }
}
