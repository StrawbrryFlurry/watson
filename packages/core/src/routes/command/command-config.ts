import { CommandArgumentType, ICommandOptions, ICommandParam, IReceiverOptions, isEmpty, isNil } from '@watsonjs/common';
import { CommandPrefix } from '@watsonjs/common/command/common/command-prefix';

import { ApplicationConfig } from '../../application-config';
import { CommandConfigurationException } from '../../exceptions';
import { IMethodValue } from '../../injector';
import { AbstractEventConfiguration } from '../event.configuration';
import { CommandRoute } from './command-route';

export class CommandConfiguration extends AbstractEventConfiguration {
  public prefix: CommandPrefix;
  public name: string;
  public alias: string[];
  public caseSensitive: boolean;
  public params?: ICommandParam[] = [];
  public description?: string;
  public tags?: string[];
  public guild?: boolean;
  public dm?: boolean;
  // public clientPermissions: PermissionResolvable[];
  // public cooldown: ICommandCooldown;
  public promt: boolean;
  public maxPromts: number;
  public promtTimeout: number;
  public hidden: boolean;

  constructor(
    public host: CommandRoute,
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
    if (this.commandOptions.name) {
      return (this.name = this.commandOptions.name);
    }

    this.name = this.method.name;
  }

  private setPrefix() {
    if (this.commandOptions.prefix) {
      return this.applyPrefix(this.commandOptions.prefix);
    }

    if (this.receiverOptions.prefix) {
      return this.applyPrefix(this.receiverOptions.prefix);
    }

    if (this.config.globalCommandPrefix) {
      return this.applyPrefix(this.config.globalCommandPrefix);
    }

    this.prefix = undefined;
  }

  private applyPrefix(prefix: string | CommandPrefix) {
    if (prefix instanceof CommandPrefix) {
      this.prefix = prefix;
    } else {
      this.prefix = new CommandPrefix(prefix);
    }
  }

  private setParams() {
    if (typeof this.commandOptions.params === "undefined") {
      return;
    }

    this.commandOptions.params.forEach((param, idx) => {
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
    if (this.commandOptions?.caseSensitive === false) {
      this.caseSensitive = false;
    } else {
      this.caseSensitive = true;
    }

    this.alias = this.commandOptions.alias || [];
  }

  public hasParams() {
    return !isEmpty(this.params);
  }

  public hasPrefix() {
    return !isNil(this.prefix);
  }
}
