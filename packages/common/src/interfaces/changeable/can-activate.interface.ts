import { Observable } from "rxjs";

import { ExecutionContext } from "../../interfaces";

/**
 * Guards will check incomming commands for user permissions or other data you might
 * want to check before enabeling them to run a command. If the guard returns false, the framework
 * will throw a `UnauthorizedException`. If don't want this to happen simply throw your own exception instead of returning `false`
 *
 * @param ctx The current execution context
 * @returns {boolean} Whether the user should be allowed to run the command or not.
 */
export interface CanActivate {
  canActivate(
    ctx: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;
}
