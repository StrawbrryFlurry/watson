import { Observable } from 'rxjs';

import { EventException } from './event-execution.exception';

export abstract class EventExceptionHandler<T extends EventException[]> {
  exceptions: T;

  constructor(exception: T);
  constructor(exceptions: T[]);
  constructor(exceptions: T | T[]) {
    if (!Array.isArray(exceptions)) {
      exceptions = [exceptions];
    }

    this.exceptions = exceptions as T;
  }

  public abstract catch(err: T): void | Promise<void> | Observable<void>;

  public match(exception: EventException): boolean {
    return this.exceptions.some((e: any) => exception instanceof e);
  }
}
