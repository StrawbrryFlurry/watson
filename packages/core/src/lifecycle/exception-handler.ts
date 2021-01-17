import { EventException, EventExceptionHandler } from '@watson/common';

import { Logger } from '../logger';

export class ExceptionHandler {
  private handlers: EventExceptionHandler<any>[];
  private logger = new Logger(ExceptionHandler.name);

  constructor(handlers: EventExceptionHandler<any>[]) {
    // The first handler wil be the CommonExceptionHandler
    // which would lead to custom handlers not being used
    // when a common exception is thrown
    this.handlers = handlers.reverse();
  }

  public handle(exception: EventException | Error) {
    if (!(exception instanceof EventException)) {
      return this.handleUnknownException(exception.message);
    }

    const handler = this.handlers.find((handler) => handler.match(exception));

    if (!handler) {
      this.handleUnknownException(exception.message);
    }

    try {
      handler.catch(exception);
    } catch (err) {
      this.handleUnknownException(err);
    }
  }

  private handleUnknownException(message: string) {
    this.logger.log(message, "error");
  }
}
