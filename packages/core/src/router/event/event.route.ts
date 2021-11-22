import { WatsonEvent } from '@watsonjs/common';
import { RouterRef } from '@watsonjs/core';

import { RouteRef } from '..';

// TODO:
export class EventRouteImpl<T extends WatsonEvent> extends RouteRef {
  public handler: Function;
  public host: RouterRef;
}
