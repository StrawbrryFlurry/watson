import { IClientEvent } from '@watsonjs/common';

import { AbstractEventConfiguration } from '../event.configuration';

export class EventConfiguration extends AbstractEventConfiguration {
  constructor(event: IClientEvent) {
    super(event);
  }
}
