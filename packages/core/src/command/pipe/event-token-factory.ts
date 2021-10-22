import { hash } from '@core/utils';
import { BaseRoute, isNil } from '@watsonjs/common';

export class EventTokenFactory<T extends BaseRoute = BaseRoute> extends WeakMap<
  T,
  string
> {
  public create(route: T) {
    const id = this.hashToId(route);
    this.set(route, id);
    return id;
  }

  public hashToId(route: T) {
    const { handler, host, event, type } = route;
    const routeId = `${event}${type}${(host as Function).name}${handler.name}`;
    return hash(routeId);
  }

  public getRouteId(route: T) {
    const id = this.get(route);

    if (!isNil(id)) {
      return id;
    }

    return this.create(route);
  }
}
