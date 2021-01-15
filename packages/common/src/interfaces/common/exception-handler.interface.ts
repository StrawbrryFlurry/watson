import { EventExecutionException } from 'exceptions';
import { ExecutionContext } from 'interfaces/context';
import { Observable } from 'rxjs';

export interface ExceptionHandler {
  catch(
    err: EventExecutionException,
    ctx: ExecutionContext
  ): void | Promise<void> | Observable<void>;
}
