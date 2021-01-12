import { IClientEvent } from '@watson/common';

export abstract class EventConfiguration {
  public readonly clientEvent: IClientEvent;

  constructor(event: IClientEvent) {
    this.clientEvent = event;
  }
}
