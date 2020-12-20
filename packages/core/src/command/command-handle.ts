import { ICommandOptions, IReceiverOptions, TReceiver } from '@watson/common';
import { Message } from 'discord.js';

import { ApplicationConfig } from '../application-config';
import { IMethodValue, InstanceWrapper } from '../injector';
import { WatsonContainer } from '../watson-container';
import { CommandConfiguration } from './command-config';

export class CommandHandle {
  public configuration: CommandConfiguration;
  public host: InstanceWrapper<TReceiver>;
  public descriptor: Function;
  private container: WatsonContainer;

  constructor(
    private method: IMethodValue,
    private receiverOptions: IReceiverOptions,
    private commandOptions: ICommandOptions,
    private applicationConfig: ApplicationConfig,
    private receiver: InstanceWrapper<TReceiver>,
    container: WatsonContainer
  ) {
    this.configuration = new CommandConfiguration(
      commandOptions,
      receiverOptions,
      applicationConfig,
      method
    );

    this.descriptor = method.descriptor;
    this.host = receiver;
    this.container = container;
  }

  matchesMessage(message: Message) {}
}
