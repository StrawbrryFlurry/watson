import { Injector, InjectorGetResult } from '@core/di';
import { BaseRoute, Injectable, MessageSendable, Providable, Type } from '@watsonjs/common';

import { RouteRef } from '.';

@Injectable({ providedIn: "module" })
export abstract class RouterRef<T = any> implements Injector {
  public abstract parent: Injector | null;
  public abstract metatype: Type;
  public abstract name: string;

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
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
