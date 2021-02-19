import { IClientEvent } from '@watsonjs/common';

export abstract class AbstractEventConfiguration {
  public readonly clientEvent: IClientEvent;

  constructor(event: IClientEvent) {
    this.clientEvent = event;
  }
}
