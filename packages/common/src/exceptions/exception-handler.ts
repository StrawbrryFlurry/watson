import { Observable } from 'rxjs';

import { EventException } from './event.exception';

export abstract class EventExceptionHandler<T extends EventException = any> {
  exceptions: EventException[];

  constructor(exception: T);
  constructor(exceptions: T[]);
  constructor(exceptions: T | T[]) {
    if (!Array.isArray(exceptions)) {
      exceptions = [exceptions];
    }

    this.exceptions = exceptions;
  }

  public abstract catch(
    err: EventException
  ): void | Promise<void> | Observable<void>;

  public match(exception: EventException): boolean {
    return this.exceptions.some((e: any) => exception instanceof e);
  }
}
