import { IClientEvent } from '@watsonjs/common';

import { EventConfiguration } from '../event.configuration';

export class ConcreteEventConfiguration extends EventConfiguration {
  constructor(event: IClientEvent) {
    super(event);
  }
}
