import { EventRoute, TReceiver, WatsonEvent } from '@watsonjs/common';

import { InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { AbstractRoute } from '../abstract-route';

export class EventRouteHost<T extends WatsonEvent>
  extends AbstractRoute<T>
  implements EventRoute {
  public handler: Function;
  public host: InstanceWrapper<TReceiver>;

  constructor(
    event: T,
    receiver: InstanceWrapper<TReceiver>,
    handler: Function,
    container: WatsonContainer
  ) {
    super("event", event, container);

    this.host = receiver;
    this.handler = handler;
  }
}
