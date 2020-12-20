import { ICommandOptions, ICommandParams, IReceiverOptions } from '@watson/common';

import { ApplicationConfig } from '../application-config';
import { NonExistingPrefixException } from '../exceptions';
import { IMethodValue } from '../injector';

export interface ICommandOptionsArgs {
  method: IMethodValue;
  receiverOptions: IReceiverOptions;
  commandOptions: ICommandOptions;
  applicationConfig: ApplicationConfig;
}

export class CommandConfiguration {
  public prefix: string;
  public name: string;
  public useRegex?: boolean;
  public regex?: RegExp;
  public allowedChannelNames?: string[];
  public allowedChannelIds?: string[];
  public alias?: string[];
  public caseSensitive: boolean;
  public params?: ICommandParams;

  constructor(private args: ICommandOptionsArgs) {
    this.setPrefix();
    this.setName();
    this.setParams();
    this.setConfiguration();
  }

  private setName() {
    if (this.args.commandOptions.command) {
      return (this.name = this.args.commandOptions.command);
    }

    if (this.args.receiverOptions.command) {
      return (this.name = this.args.receiverOptions.command);
    }

    this.name = this.args.method.name;
  }

  private setPrefix() {
    if (this.args.receiverOptions.prefix) {
      return (this.prefix = this.args.receiverOptions.prefix);
    }

    if (this.args.applicationConfig.globalCommandPrefix) {
      return (this.prefix = this.args.applicationConfig.globalCommandPrefix);
    }

    throw new NonExistingPrefixException(this.name);
  }

  private setParams() {}

  private setConfiguration() {
    if (this.args.receiverOptions.commandOptions?.casesensitive) {
      this.caseSensitive = true;
    } else {
      this.caseSensitive = false;
    }

    this.alias = this.args.commandOptions.alias || [];

    if (this.args.receiverOptions.channel) this.isChannelRestricted;
  }

  public get isChannelRestricted() {
    return (
      this.allowedChannelIds.length > 0 || this.allowedChannelNames.length > 0
    );
  }
}
