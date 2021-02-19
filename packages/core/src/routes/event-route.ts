import { IClientEvent, TReceiver } from '@watsonjs/common';

import { InstanceWrapper } from '../injector';
import { IAsynchronousResolvable } from '../interfaces';
import { WatsonContainer } from '../watson-container';
import { AbstractEventConfiguration } from './event.configuration';

export type IExecutionContextType = "slash" | "event" | "command";

export abstract class AbstractEventRoute<Event extends IClientEvent> {
  public readonly contextType: IExecutionContextType;
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @Command, @event
   */
  public abstract readonly handler: Function;
  public abstract readonly host: InstanceWrapper<TReceiver>;
  public abstract readonly config: AbstractEventConfiguration;
  public readonly container: WatsonContainer;

  constructor(type: IExecutionContextType, container: WatsonContainer) {
    this.contextType = type;
    this.container = container;
  }

  public abstract matchEvent(
    ...eventArgs: unknown[]
  ): IAsynchronousResolvable<boolean>;

  public abstract createContextData(
    eventArgs: unknown[]
  ): IAsynchronousResolvable<any>;

  public get eventType() {
    return this.config.clientEvent;
  }
}
