import { LifecycleFunction } from '@core/router';
import { ApplicationCommandRoute, BaseRoute, ExceptionHandler, WatsonEvent } from '@watsonjs/common';

import { AbstractProxy } from './abstract-proxy';

export class ApplicationCommandProxy extends AbstractProxy<
  WatsonEvent.INTERACTION_CREATE,
  ApplicationCommandRoute
> {
  constructor() {
    super(WatsonEvent.INTERACTION_CREATE);
  }

  public proxy(args: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public bind(
    route: BaseRoute,
    eventHandler: LifecycleFunction,
    exceptionHandler: ExceptionHandler
  ): void {
    throw new Error("Method not implemented.");
  }
}
