import { Injector, InjectorGetResult } from '@core/di';
import { BaseRoute, DIProvided, MessageSendable } from '@watsonjs/common';

import { RouteRef } from '.';

export abstract class RouterRef<T = any>
  extends DIProvided({ providedIn: "module" })
  implements Injector
{
  public abstract parent: Injector | null;
  public abstract get<T extends unknown, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R>;

  /**
   * The application level router.
   * {@link ApplicationRouterRef}
   */
  public abstract root: any;
  /** Returns all routes mapped within the router */
  public abstract getRoutes(): BaseRoute[];
  /**
   * Dispatches `route`, essentially imitating an
   * event emitted by the client that the route
   * is bound to.
   */
  public abstract dispatch<T extends RouteRef>(
    route: T
  ): Promise<MessageSendable | void>;
}

export class ApplicationRouterRef {}
