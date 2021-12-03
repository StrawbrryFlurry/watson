import { RouterRef } from '@core/router/application-router';
import { RouteRef } from '@core/router/route-ref';
import { WatsonEvent } from '@watsonjs/common';

// TODO:
export class EventRouteImpl<T extends WatsonEvent> extends RouteRef {
  public handler: Function;
  public host: RouterRef;
}
