import {
  CommandArgumentType,
  CommandConfiguration,
  CommandPrefix,
  ICommandCooldown,
  ICommandOptions,
  ICommandParam,
  IReceiverOptions,
  isEmpty,
  isNil,
} from '@watsonjs/common';
import { isString } from 'class-validator';
import { PermissionResolvable } from 'discord.js';

import { ApplicationConfig } from '../../application-config';
import { CommandConfigurationException } from '../../exceptions';
import { IMethodValue } from '../../injector';
import { CommandPrefixHost } from './command-prefix-host';
import { CommandRouteHost } from './command-route-host';

export class CommandConfigurationHost implements CommandConfiguration {
  public prefix: CommandPrefix;
  public name: string;
  public alias: string[];
  public caseSensitive: boolean;
  public params: ICommandParam[] = [];
  public description: string;
  public tags: string[];
  public guild: boolean;
  public dm: boolean;
  public commandGroup: string;
  public clientPermissions: PermissionResolvable[];
  public cooldown?: ICommandCooldown;
  public promt: boolean;
  public maxPromts: number;
  public promtTimeout: number;
  public hidden: boolean;

  constructor(
    public host: CommandRouteHost,
    private commandOptions: ICommandOptions,
    private receiverOptions: IReceiverOptions,
    private config: ApplicationConfig,
    private method: IMethodValue
  ) {
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
    const { prefix, namedPrefix } = this.commandOptions;

    if (prefix && namedPrefix) {
      this.applyPrefix(prefix);
    } else if (prefix) {
      return this.applyPrefix(prefix);
    }

    if (namedPrefix) {
      return this.applyPrefix(namedPrefix, true);
    }

    const {
      prefix: receiverPrefix,
      namedPrefix: receiverNamedPrefix,
    } = this.receiverOptions;

    if (receiverPrefix) {
      return this.applyPrefix(receiverPrefix);
    }

    if (receiverNamedPrefix) {
      return this.applyPrefix(receiverNamedPrefix, true);
    }

    const { globalCommandPrefix } = this.config;

    if (globalCommandPrefix) {
      return this.applyPrefix(globalCommandPrefix);
    }

    this.prefix = undefined;
  }

  private applyPrefix(prefix: string | CommandPrefix, named?: boolean) {
    if (isString(prefix)) {
      this.prefix = new CommandPrefixHost(prefix, named);
    } else {
      this.prefix = prefix;
    }
  }

  private setParams() {
    const { params } = this.commandOptions;

    if (typeof params === "undefined") {
      return;
    }

    params.forEach((param, idx) => {
      if (param.type === CommandArgumentType.DATE) {
        if (isNil(param.dateFormat)) {
          throw new CommandConfigurationException(
            "CommandLoader",
            `Param ${param.name} is of type date but doesn't have a format set`
          );
        }
      }

      if (param.hungry && idx !== params.length - 1) {
        throw new CommandConfigurationException(
          "CommandLoader",
          `A hungry parameter has to be the last parameter for a command.`
        );
      }

      if (isNil(param.optional)) {
        param.optional = false;
      }

      this.params.push(param);
    });
  }

  private setConfiguration() {
    const {
      alias,
      caseSensitive,
      clientPermissions,
      cooldown,
      description,
      dm,
      guild,
      hidden,
      maxPromts,
      promt,
      promtTimeout,
      tags,
    } = this.commandOptions;

    const { groupName } = this.receiverOptions;

    this.alias = alias || [];
    this.clientPermissions = clientPermissions || [];

    if (!isNil(cooldown)) {
      const { timeout, user } = cooldown;

      this.cooldown = {
        timeout: timeout || 5,
        user: isNil(user) ? true : user,
      };
    }

    this.description = description || "";
    this.dm = dm || false;
    this.promt = promt || false;
    this.tags = tags || [];
    this.promtTimeout = promtTimeout || 10;
    this.maxPromts = maxPromts || 1;

    this.guild = isNil(guild) ? true : guild;
    this.hidden = isNil(hidden) ? true : hidden;
    this.caseSensitive = isNil(caseSensitive) ? false : caseSensitive;
    this.commandGroup = groupName;
  }

  public hasParams() {
    return !isEmpty(this.params);
  }

  public hasPrefix() {
    return !isNil(this.prefix);
  }
}
