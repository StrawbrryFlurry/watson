import { ICommandOptions, ICommandParams, IReceiverOptions } from '@watson/common';

import { ApplicationConfig } from '../application-config';
import { NonExistingPrefixException } from '../exceptions';
import { IMethodValue } from '../injector';

export class CommandHandle {
  public prefix: string;
  public name: string;
  public useRegex?: boolean;
  public regex?: RegExp;
  public allowedChannelNames?: string[];
  public allowedChannelIds?: string[];
  public alias?: string[];
  public caseSensitive: boolean;
  public params?: ICommandParams;

  constructor(
    private method: IMethodValue,
    private receiverOptions: IReceiverOptions,
    private commandOptions: ICommandOptions,
    private applicationConfig: ApplicationConfig
  ) {
    this.setPrefix();
    this.setName();
    this.setArguments();
    this.setConfiguration();
  }

  private setName() {
    if (this.commandOptions.command) {
      return (this.name = this.commandOptions.command);
    }

    if (this.receiverOptions.command) {
      return (this.name = this.receiverOptions.command);
    }

    this.name = this.method.name;
  }

  private setPrefix() {
    if (this.receiverOptions.prefix) {
      return (this.prefix = this.receiverOptions.prefix);
    }

    if (this.applicationConfig.globalCommandPrefix) {
      return (this.prefix = this.applicationConfig.globalCommandPrefix);
    }

    throw new NonExistingPrefixException(this.name);
  }

  private setArguments() {}

  private setAliases() {}

  private setConfiguration() {}
}
