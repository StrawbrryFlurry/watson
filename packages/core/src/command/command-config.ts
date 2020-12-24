import { CommandArgumentType, ICommandOptions, ICommandParam, IReceiverOptions } from '@watson/common';
import { PermissionString, TextChannel } from 'discord.js';

import { ApplicationConfig } from '../application-config';
import { CommandConfigurationException, NonExistingPrefixException } from '../exceptions';
import { IMethodValue } from '../injector';
import { CommandContext } from './command-context';
import { ICommandRestrictions } from './command-explorer';

export class CommandConfiguration {
  public prefix: string;
  public name: string;
  public paramRegex?: RegExp;
  public paramDelimiter: string;

  public directMessage: boolean;

  public allowedChannelIds = new Set<string>();
  public allowedChannels = new Set<string>();

  public disallowedChannelIds = new Set<string>();
  public disallowedChannels = new Set<string>();

  public requiredRoles = new Set<string>();
  public requiredPermissions = new Set<PermissionString>();
  public requiresAllPermissions: boolean;

  public alias: string[];
  public caseSensitive: boolean;
  public params?: ICommandParam[] = [];

  constructor(
    private commandOptions: ICommandOptions,
    private receiverOptions: IReceiverOptions,
    private config: ApplicationConfig,
    private method: IMethodValue
  ) {
    this.setName();
    this.setPrefix();
    this.setRestrictions();
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

    throw new NonExistingPrefixException("CommandExplorer", this.name);
  }

  private setParams() {
    if (this.useRegex) {
      return (this.params = this.commandOptions.params);
    }

    if (typeof this.commandOptions.params === "undefined") {
      return;
    }

    this.commandOptions.params.forEach((param) => {
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

    this.directMessage = this.commandOptions.directMessage || false;

    const regex = this.commandOptions.paramRegex;

    if (typeof regex !== "undefined" && regex instanceof RegExp) {
      this.paramRegex = regex;
    } else {
      const delimiter = this.commandOptions.pramDelimiter;

      if (typeof delimiter === "undefined") {
        this.paramDelimiter = " ";
      } else {
        this.paramDelimiter = delimiter;
      }
    }
  }

  private setRestrictions() {
    const restrictions: ICommandRestrictions = this.commandOptions[
      "restrictions"
    ];

    this.requiresAllPermissions = restrictions?.allPermissionsRequired || false;

    if (typeof restrictions === "undefined") {
      return;
    }

    for (const role of restrictions.roles) {
      this.requiredRoles.add(role);
    }

    for (const permission of restrictions.permissions) {
      this.requiredPermissions.add(permission);
    }

    for (const channelId in restrictions.channelIds) {
      this.allowedChannelIds.add(channelId);
    }

    for (const channel in restrictions.channels) {
      this.allowedChannelIds.add(channel);
    }
  }

  public get isRestrictedToChannel() {
    return (
      this.allowedChannels.size > 0 ||
      this.allowedChannelIds.size > 0 ||
      !this.directMessage
    );
  }

  public get requiresRoles() {
    return this.requiredRoles.size > 0;
  }

  public get requiresPermission() {
    return this.requiredPermissions.size > 0;
  }

  public get hasParams() {
    return this.params.length !== 0 || this.useRegex;
  }

  public get useRegex() {
    return typeof this.paramRegex !== "undefined" && this.params.length !== 0;
  }

  public get hasSentence() {
    return this.params.some(
      (param) => param.type === CommandArgumentType.SENTENCE
    );
  }

  public hasRoles(ctx: CommandContext) {
    if (!this.requiresRoles) {
      return true;
    }

    return this.corssMatchSet(this.requiredRoles, ctx.userRoleNames);
  }

  public hasPermissions(ctx: CommandContext) {
    if (!this.requiresPermission) {
      return true;
    }

    return this.corssMatchSet(
      this.requiredPermissions,
      ctx.userPermissions,
      this.requiresAllPermissions
    );
  }

  public matchesChannel(ctx: CommandContext) {
    if (!this.isRestrictedToChannel) {
      return true;
    }

    if (this.allowedChannelIds.has(ctx.channel.id)) {
      return true;
    }

    if (this.allowedChannels.has((ctx.channel as TextChannel).name)) {
      return true;
    }

    return false;
  }

  private corssMatchSet<T>(
    targetSet: Set<T>,
    matchingSet: Set<T>,
    fullMatch?: boolean
  ): boolean {
    if (targetSet.size === 0) {
      return true;
    }

    for (const value of targetSet) {
      if (matchingSet.has(value)) {
        continue;
      }

      if (typeof fullMatch !== "undefined" && fullMatch === true) {
        return false;
      }
    }

    return true;
  }
}
