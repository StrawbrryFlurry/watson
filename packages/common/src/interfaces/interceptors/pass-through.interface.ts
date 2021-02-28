import { Observable } from 'rxjs';

import { ExecutionContext } from '..';

/**
 * Filters work in a similar way to guards. Their difference being that they will not throw an error if the command shouldn't be run.
 * Additionally they're also supported on EventRoutes.
 * @param context The current execution context
 * @returns {boolean} Whether the user should be allowed to run the command or not.
 */
export interface PassThrough {
  pass(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;
}
