import { CommandArgumentType, ICommandOptions, ICommandParam, IReceiverOptions, isEmpty, isNil } from '@watson/common';

import { ApplicationConfig } from '../../application-config';
import { CommandConfigurationException } from '../../exceptions';
import { IMethodValue } from '../../injector';
import { EventConfiguration } from '../event.configuration';

export class CommandConfiguration extends EventConfiguration {
  public prefix: string;
  public name: string;
  public alias: string[];
  public paramDelimiter: string;
  public caseSensitive: boolean;
  public params?: ICommandParam[] = [];

  constructor(
    private commandOptions: ICommandOptions,
    private receiverOptions: IReceiverOptions,
    private config: ApplicationConfig,
    private method: IMethodValue
  ) {
    super("message");

    this.setName();
    this.setPrefix();
    this.setConfiguration();
    this.setParams();
  }

  private setName() {
    if (this.commandOptions.command) {
      return (this.name = this.commandOptions.command);
    }

    this.name = this.method.name;
  }

  private setPrefix() {
    if (this.commandOptions.prefix) {
      return (this.prefix = this.commandOptions.prefix);
    }

    if (this.receiverOptions.prefix) {
      return (this.prefix = this.receiverOptions.prefix);
    }

    if (this.config.globalCommandPrefix) {
      return (this.prefix = this.config.globalCommandPrefix);
    }

    this.prefix = undefined;
  }

  private setParams() {
    if (typeof this.commandOptions.params === "undefined") {
      return;
    }

    this.commandOptions.params.forEach((param, idx) => {
      if (param.type === CommandArgumentType.SENTENCE) {
        if (typeof param.encapsulator === "undefined") {
          throw new CommandConfigurationException(
            "CommandLoader",
            `Param ${param.name} is of type sentece but doesn't have an encapsulator set`
          );
        }
      }

      if (param.type === CommandArgumentType.DATE) {
        if (typeof param.dateFormat === "undefined") {
          throw new CommandConfigurationException(
            "CommandLoader",
            `Param ${param.name} is of type date but doesn't have a format set`
          );
        }
      }

      if (param.hungry && idx !== this.commandOptions.params.length - 1) {
        throw new CommandConfigurationException(
          "CommandLoader",
          `A hungry parameter has to be the last parameter for a command.`
        );
      }

      if (typeof param.optional === "undefined") {
        param.optional = false;
      }

      this.params.push(param);
    });
  }

  private setConfiguration() {
    if (this.commandOptions?.caseSensitive) {
      this.caseSensitive = true;
    } else if (this.receiverOptions.commandOptions?.casesensitive) {
      this.caseSensitive = true;
    } else {
      this.caseSensitive = false;
    }

    this.alias = this.commandOptions.alias || [];

    const delimiter = this.commandOptions.pramDelimiter;

    if (typeof delimiter === "undefined") {
      this.paramDelimiter = " ";
    } else {
      this.paramDelimiter = delimiter;
    }
  }

  public hasParams() {
    return !isEmpty(this.params);
  }

  public hasPrefix() {
    return !isNil(this.prefix);
  }

  public hasSentence() {
    return this.params.some(
      (param) => param.type === CommandArgumentType.SENTENCE
    );
  }
}
