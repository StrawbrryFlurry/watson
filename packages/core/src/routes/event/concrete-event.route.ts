import { EventContextData, IClientEvent, TReceiver } from '@watsonjs/common';
import { Base, ClientEvents } from 'discord.js';

import { InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { AbstractEventRoute } from '../event-route';
import { EventConfiguration } from './concrete-event-configuration';

export class EventRoute<T extends IClientEvent> extends AbstractEventRoute<T> {
  public handler: Function;
  public host: InstanceWrapper<TReceiver>;
  public config: EventConfiguration;

  constructor(
    event: T,
    receiver: InstanceWrapper<TReceiver>,
    handler: Function,
    container: WatsonContainer
  ) {
    super("event", container);

    this.config = new EventConfiguration(event);
    this.host = receiver;
    this.handler = handler;
  }

  public async matchEvent(eventData: ClientEvents[T]) {
    return true;
  }

  public createContextData(eventArgs: Base[]): EventContextData {
    if (this.eventType === ("raw" as any)) {
      return eventArgs as any;
    } else {
      let parsedEventData = {};

      for (const data of eventArgs) {
        parsedEventData[data.constructor.name.toLowerCase()] = data;
      }

      return parsedEventData;
    }
  }
}
