import { RouterRef } from '@core/router/application-router';
import { RouteRef } from '@core/router/route-ref';
import { ContextType, EventRoute, WatsonEvent } from '@watsonjs/common';
import { MethodDescriptor } from '@watsonjs/di';

export class EventRouteImpl<T extends WatsonEvent>
  extends RouteRef<WatsonEvent>
  implements EventRoute
{
  public host: RouterRef<any>;

  constructor(
    event: WatsonEvent,
    router: RouterRef,
    handler: MethodDescriptor
  ) {
    super(ContextType.event, event, handler);
    this.host = router;
  }
}
