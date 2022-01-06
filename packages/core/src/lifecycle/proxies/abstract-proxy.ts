import { ExceptionHandlerRef } from '@core/lifecycle';
import { LifecycleFunction } from '@core/router/route-handler-factory';
import { BaseRoute, WatsonEvent } from '@watsonjs/common';
import iterate from 'iterare';

export abstract class AbstractProxy<
  Event extends WatsonEvent = WatsonEvent,
  Route extends BaseRoute = BaseRoute,
  ProxyData = any
> {
  public readonly handlers = new Map<Route, LifecycleFunction>();
  public readonly routes: BaseRoute[] = [];

  constructor(
    /**
     * The {@link WatsonEvent} this proxy is bound to
     */
    public readonly type: Event,
    /**
     * If the proxy is bound to the discord websocket
     * connection or the client event emitter
     */
    public readonly isWsEvent: boolean = false
  ) {}

  public abstract bind(route: Route, handlerFn: LifecycleFunction): void;

  protected bindHandler(route: Route, handlerFn: LifecycleFunction): void {
    this.routes.push(route);
    this.handlers.set(route, handlerFn);
  }

  public getHandlerFns(): [Route, LifecycleFunction][] {
    return iterate(this.handlers).toArray();
  }

  /**
   * When the application `AdapterRef` receives
   * an event that this proxy is listening
   * for, this method on the proxy is called
   * with the data emitted from the adapter.
   */
  public abstract proxy(args: ProxyData): Promise<void>;

  protected getExceptionHandler(
    route: BaseRoute
  ): Promise<ExceptionHandlerRef> {
    const { host } = route;
    return host.get(ExceptionHandlerRef);
  }
}
