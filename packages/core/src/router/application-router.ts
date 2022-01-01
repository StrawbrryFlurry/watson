import { BaseRoute, MessageSendable } from '@watsonjs/common';
import { ComponentRef, Injectable } from '@watsonjs/di';
import iterate from 'iterare';

@Injectable({ providedIn: "module" })
export abstract class RouterRef<
  T extends object = any
> extends ComponentRef<T> {
  /**
   * A map of all routes that are
   * bound within this router.
   */
  public readonly routes = new Map<
    /**
     * Function of the route
     *  method in the router
     */ Function,
    BaseRoute
  >();

  /**
   * The application level router.
   * {@link ApplicationRouterRef}
   */
  public abstract root: ApplicationRouterRef;

  /** Returns all routes mapped within the router */
  public getRoutes(): BaseRoute[] {
    return iterate(this.routes.values()).toArray();
  }

  /**
   * Returns a `RouteRef` for any route
   * mapped within this router. provide
   * the function reference of the method
   * from which you want to get the route.
   *
   * ```js
   * \@Router()
   * class SomeRouter {
   *   constructor(private routerRef: RouterRef) {
   *     const routeRef = this.routerRef.getRoute<CommandRoute>(this.someCommand);
   *   }
   *
   *   \@Command()
   *   someCommand() {  }
   * }
   * ```
   */
  public getRoute<T extends BaseRoute>(methodRef: Function): T | null {
    return <T>this.routes.get(methodRef) ?? null;
  }

  /**
   * Dispatches `route`, essentially imitating an
   * event emitted by the client that the route
   * is bound to.
   */
  public abstract dispatch<T extends BaseRoute>(
    route: T
  ): Promise<MessageSendable | void>;
}

export class ApplicationRouterRef {}
