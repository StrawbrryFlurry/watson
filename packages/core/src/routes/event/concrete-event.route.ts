import { EventContextData, IClientEvent, TReceiver } from '@watsonjs/common';
import { Base, ClientEvents } from 'discord.js';

import { InstanceWrapper } from '../../injector';
import { WatsonContainer } from '../../watson-container';
import { EventRoute } from '../event-route';
import { ConcreteEventConfiguration } from './concrete-event-configuration';

export class ConcreteEventRoute<T extends IClientEvent> extends EventRoute<T> {
  public handler: Function;
  public host: InstanceWrapper<TReceiver>;
  public config: ConcreteEventConfiguration;

  constructor(
    event: T,
    receiver: InstanceWrapper<TReceiver>,
    handler: Function,
    container: WatsonContainer
  ) {
    super("event", container);

    this.config = new ConcreteEventConfiguration(event);
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
