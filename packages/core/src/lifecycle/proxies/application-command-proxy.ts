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
    // TODO:
    // Check if the interaction is an event that should update a button or text
    // Check if the interaction is a command, if so run that handler
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
