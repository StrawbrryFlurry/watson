import { ICommandOptions, ICommandParam, IReceiverOptions } from '@watson/common';
import { PermissionString } from 'discord.js';

import { ApplicationConfig } from '../application-config';
import { NonExistingPrefixException } from '../exceptions';
import { IMethodValue } from '../injector';
import { CommandContext } from './command-context';

export class CommandConfiguration {
  public prefix: string;
  public name: string;
  public useRegex: boolean;
  public regex?: RegExp;

  public allowedChannelIds = new Set<string>();
  public allowedChannels = new Set<string>();

  public disallowedChannelIds = new Set<string>();
  public disallowedChannels = new Set<string>();

  public requiredRoles = new Set<string>();

  public fullyRequiredPermissions = new Set<PermissionString>();
  public requiredPermissions = new Set<PermissionString>();

  public alias: string[];
  public caseSensitive: boolean;
  public params?: ICommandParam[];

  constructor(
    private commandOptions: ICommandOptions,
    private receiverOptions: IReceiverOptions,
    private config: ApplicationConfig,
    private method: IMethodValue
  ) {
    this.setName();
    this.setPrefix();
    this.setParams();
    this.setConfiguration();
  }

  private setName() {
    if (this.commandOptions.command) {
      return (this.name = this.commandOptions.command);
    }

    this.name = this.method.name;
  }

  private setPrefix() {
    if (this.receiverOptions.prefix) {
      return (this.prefix = this.receiverOptions.prefix);
    }

    if (this.config.globalCommandPrefix) {
      return (this.prefix = this.config.globalCommandPrefix);
    }

    throw new NonExistingPrefixException(this.name);
  }

  private setParams() {}

  private setConfiguration() {
    if (this.receiverOptions.commandOptions?.casesensitive) {
      this.caseSensitive = true;
    } else {
      this.caseSensitive = false;
    }

    this.alias = this.commandOptions.alias || [];
  }

  public get isRestrictedToChannel() {
    return this.allowedChannels.size > 0 || this.allowedChannelIds.size > 0;
  }

  public get requiresRoles() {
    return this.requiredRoles.size > 0;
  }

  public get requiresPermission() {
    return (
      this.requiredPermissions.size > 0 ||
      this.fullyRequiredPermissions.size > 0
    );
  }

  public hasRoles(ctx: CommandContext) {
    if (!this.requiresRoles) {
      return true;
    }

    return this.corssMatchSet(this.requiredRoles, ctx.userRoleNames, false);
  }

  public hasPermissions(ctx: CommandContext) {
    if (!this.requiresPermission) {
      return true;
    }

    return (
      this.corssMatchSet(
        this.fullyRequiredPermissions,
        ctx.userPermissions,
        true
      ) &&
      this.corssMatchSet(this.requiredPermissions, ctx.userPermissions, false)
    );
  }

  public matchesChannel(ctx: CommandContext) {
    if (!this.isRestrictedToChannel) {
      return true;
    }

    if (this.allowedChannelIds.has(ctx.channel.id)) {
      return true;
    }

    if (this.allowedChannels.has(ctx.channel.name)) {
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
