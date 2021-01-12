import { IClientEvent, TReceiver } from '@watson/common';
import { ClientEvents } from 'discord.js';
import { EventRoute } from 'event';
import { InstanceWrapper } from 'injector';
import { WatsonContainer } from 'watson-container';

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

  public async matchEvent(...eventData: ClientEvents[T]) {
    return true;
  }

  public createContextData(...eventArgs: unknown[]) {
    throw new Error("Method not implemented.");
  }
}
