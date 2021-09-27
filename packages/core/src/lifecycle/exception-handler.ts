import { EventException, EventExceptionHandler } from '@watsonjs/common';

import { Logger } from '../logger';

export class ExceptionHandlerImpl {
  private handlers: EventExceptionHandler[];
  private logger = new Logger(ExceptionHandler.name);

  constructor(handlers: EventExceptionHandler[]) {
    // The first handler wil be the CommonExceptionHandler
    // which would lead to custom handlers not being used
    // when a common exception is thrown
    this.handlers = handlers.reverse();
  }

  public handle(exception: EventException | Error) {
    if (!(exception instanceof EventException)) {
      return this.handleUnknownException(exception.message, exception.stack);
    }

    const handler = this.handlers.find((handler) => handler.match(exception));

    if (!handler) {
      this.handleUnknownException(exception.message, exception.stack);
    }

    try {
      handler.catch(exception);
    } catch (err) {
      this.handleUnknownException(err, err.stack);
    }
  }

  private handleUnknownException(message: string, stack: any) {
    this.logger.logException(message, stack);
  }
}
