import { IClientEvent } from '@watson/common';
import { EventConfiguration } from 'routes/event.configuration';

export class ConcreteEventConfiguration extends EventConfiguration {
  constructor(event: IClientEvent) {
    super(event);
  }
}
