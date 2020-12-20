import { ICommandOptions, IReceiverOptions, TReceiver } from '@watson/common';

import { ApplicationConfig } from '../application-config';
import { IMethodValue, InstanceWrapper } from '../injector';
import { WatsonContainer } from '../watson-container';
import { CommandConfiguration } from './command-config';

export interface ICommandHandleArgs {
  method: IMethodValue;
  receiverOptions: IReceiverOptions;
  commandOptions: ICommandOptions;
  applicationConfig: ApplicationConfig;
  receiver: InstanceWrapper<TReceiver>;
}

export class CommandHandle {
  public configuration: CommandConfiguration;
  public host: InstanceWrapper<TReceiver>;
  public descriptor: Function;
  private container: WatsonContainer;

  constructor(private args: ICommandHandleArgs) {
    this.configuration = new CommandConfiguration();
  }
}
