import { EventRoute, ReceiverDef, WatsonEvent } from '@watsonjs/common';

import { RouteRef } from '..';
import { InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';

// TODO:
export class EventRouteHost<T extends WatsonEvent>
  extends RouteRef<T>
  implements EventRoute
{
  public handler: Function;
  public host: InstanceWrapper<ReceiverDef>;

  constructor(
    event: T,
    receiver: InstanceWrapper<ReceiverDef>,
    handler: Function,
    container: WatsonContainer
  ) {
    super("event", event, container);

    this.host = receiver;
    this.handler = handler;
  }
}
