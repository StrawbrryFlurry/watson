import { PartialApplicationCommand, TReceiver, WatsonEvent } from '@watsonjs/common';

import { InstanceWrapper } from '../../injector';
import { IAsynchronousResolvable } from '../../interfaces';
import { WatsonContainer } from '../../watson-container';
import { AbstractRoute } from '../abstract-route';
import { SlashConfiguration } from './slash-config';

export class SlashRoute extends AbstractRoute<WatsonEvent.INTERACTION_CREATE> {
  public handler: Function;
  public host: InstanceWrapper<TReceiver>;
  public config: SlashConfiguration;

  constructor(
    config: PartialApplicationCommand,
    receiver: InstanceWrapper<TReceiver>,
    handler: Function,
    container: WatsonContainer
  ) {
    super("slash", WatsonEvent.INTERACTION_CREATE, container);

    this.host = receiver;
    this.handler = handler;
    this.config = new SlashConfiguration(config);
  }

  public matchEvent(...eventArgs: unknown[]): IAsynchronousResolvable<boolean> {
    throw new Error("Method not implemented.");
  }

  public createContextData(...eventArgs: unknown[]) {
    throw new Error("Method not implemented.");
  }

  public get name() {
    return this.config.name;
  }
}
