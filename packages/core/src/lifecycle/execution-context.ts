import { ExecutionContext, ResponseChannelType } from '@watson/common';
import { Client, DMChannel, Guild, Message, NewsChannel, PermissionString, Role, TextChannel, User } from 'discord.js';

import { CommandRoute, ICommandParams } from '../command';
import { UnknownChannelException } from '../exceptions';

export class CommandExecutionContext
  implements ExecutionContext<CommandRoute, Message> {
  private commandRoute: CommandRoute;
  public message: Message;
  public user: User;
  public params: ICommandParams;
  public userRoles = new Set<Role>();
  public userRoleNames = new Set<string>();
  public userPermissions = new Set<PermissionString>();
  public channel: TextChannel | DMChannel | NewsChannel;
  public guild: Guild;
  public client: Client;
  public isDm: boolean;
  public responseChannel: TextChannel | DMChannel;
  private _commandArguments: unknown[];
  public isInitialized: boolean = false;

  constructor(route: CommandRoute, message: Message) {
    this.commandRoute = route;
    this.message = message;
    this.channel = message.channel;
    this.user = message.author;
    this.client = message.client;
  }
  getContextData<T = any>() {
    throw new Error("Method not implemented.");
  }
  getType(): Message {
    throw new Error("Method not implemented.");
  }

  public async init() {
    await this.resolveResponseChannel();
    await this.resolveParams();

    if (this.message.channel.type === "dm") {
      return await this.initDmChannel();
    }

    this.isDm = false;
    this.guild = this.message.guild;
    const member = this.message.member;

    Object.entries(member.permissions.serialize()).forEach(
      ([permission, hasPermission]) => {
        if (!!hasPermission) {
          this.userPermissions.add(permission as PermissionString);
        }
      }
    );

    member.roles.cache.forEach((role) => {
      this.userRoleNames.add(role.name);
      this.userRoles.add(role);
    });

    this.isInitialized = true;
  }

  private async initDmChannel() {
    this.guild = undefined;
    this.isInitialized = true;
    return (this.isDm = true);
  }

  public set commandArguments(args: unknown[]) {
    this._commandArguments = args;
  }

  public get commandArguments() {
    return this._commandArguments;
  }

  private async resolveParams() {
    this.params = await this.commandRoute.checkAndParse(this);
  }

  private async resolveResponseChannel() {
    const channelType = this.commandRoute.responseChannelType;

    if (channelType === ResponseChannelType.DM) {
      const dmChannel = this.user.dmChannel;

      if (dmChannel === null) {
        return (this.responseChannel = await this.user.createDM());
      }

      return (this.responseChannel = dmChannel);
    }

    if (channelType === ResponseChannelType.SAME) {
      return (this.responseChannel = this.channel as TextChannel);
    }

    if (channelType === ResponseChannelType.OTHER) {
      const channelName = this.commandRoute.responseChannel.name;

      const channel = this.guild.channels.cache.find(
        (channel) => channel.name === channelName && channel.isText()
      );

      if (typeof channel === "undefined") {
        throw new UnknownChannelException(channelName, this.commandRoute);
      }

      return (this.responseChannel = channel as TextChannel);
    }
  }

  public getContext() {
    return this.commandRoute;
  }

  public getEvent() {
    return this.message;
  }
}
