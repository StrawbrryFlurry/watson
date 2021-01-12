import { ExecutionContext } from 'interfaces/context';
import { Observable } from 'rxjs';

/**
 * Filters work in a similar way to guards. Their difference being that they will not throw an error if the command shouldn't be run.
 * If a filter returns false the handler for this event will simply not be called.
 * @param ctx The current execution context
 * @returns {boolean} Whether the user should be allowed to run the command or not.
 */
export interface Filter {
  filter(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;
}
