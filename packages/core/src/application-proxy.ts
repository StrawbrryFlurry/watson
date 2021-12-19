import { AdapterRef } from '@core/adapters';
import { EventProxy } from '@core/lifecycle';
import { WatsonEvent } from '@watsonjs/common';

import { RouteExplorer } from '.';

export class ApplicationProxy {
  private eventProxies = new Map<WatsonEvent, EventProxy<any>>();

  constructor() {}

  public async initAdapter(adapter: AdapterRef) {
    this.applyProxiesToAdapter(adapter);
  }

  public initFromRouteExplorer(routeExplorer: RouteExplorer) {
    const proxies = (routeExplorer as any).getEventProxiesArray();

    for (const [event, proxy] of proxies) {
      this.bindProxy(event, proxy);
    }
  }

  public bindProxy(event: WatsonEvent, proxy: EventProxy<any>) {
    if (this.eventProxies.has(event)) {
      const proxyRef = this.eventProxies.get(event)!;

      /**
       * Makes sure that command / slash proxies get
       * their own event proxy
       */
      if (proxy.type === proxyRef.type) {
        this.bindToExistingProxy(event, proxy);
      } else {
        this.eventProxies.set(event, proxy);
      }
    } else {
      this.eventProxies.set(event, proxy);
    }
  }

  public applyProxiesToAdapter(adapter: AdapterRef) {
    for (const [, proxy] of this.eventProxies) {
      adapter.registerEventProxy(proxy);
    }
  }

  private bindToExistingProxy(event: WatsonEvent, proxy: EventProxy<any>) {
    const handlerFns = proxy.getHandlerFns();
    const proxyRef = this.eventProxies.get(event)!;

    for (const [routeRef, { handlerFn, exceptionHandler }] of handlerFns) {
      proxyRef.bind(routeRef, handlerFn, exceptionHandler);
    }
  }
}
