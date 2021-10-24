import { ExceptionHandler, RuntimeException } from '@watsonjs/common';
import { Observable } from 'rxjs';

export class ExceptionHandlerImpl implements ExceptionHandler {
  private handlers: ExceptionHandler[];

  constructor(handlers: ExceptionHandler[]) {
    // The first handler wil be the CommonExceptionHandler
    // which would lead to custom handlers not being used
    // when a common exception is thrown
    this.handlers = handlers.reverse();
  }

  public catch(
    exception: RuntimeException
  ): void | Promise<void> | Observable<void> {
    if (!(exception instanceof Error)) {
      return this.handleUnknownException(
        (exception as any).message,
        (exception as any).stack
      );
    }

    const handler = this.handlers.find((handler: any) =>
      handler.match(exception)
    );

    if (!handler) {
      this.handleUnknownException(exception.message, exception.stack);
    }

    try {
      (handler as any).catch(exception);
    } catch (err) {
      this.handleUnknownException(err as any, (err as any).stack);
    }
  }

  private handleUnknownException(message: string, stack: any) {
    // this.logger.logException(message, stack);
  }
}
