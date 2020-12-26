import { Client, DMChannel, Guild, Message, NewsChannel, PermissionString, Role, TextChannel, User } from 'discord.js';

import { CommandRoute, ICommandParams } from './command-route';

/**
 * Execution context of a command
 */
export class CommandContext {
  public message: Message;
  public user: User;
  public params: ICommandParams;
  public userRoles: Set<Role>;
  public userRoleNames: Set<string>;
  public userPermissions: Set<PermissionString>;
  public commandHandle: CommandRoute;
  public channel: TextChannel | DMChannel | NewsChannel;
  public guild: Guild;
  public client: Client;

  public isDm: boolean;

  constructor(message: Message) {
    this.message = message;
    this.channel = message.channel;
    this.user = message.author;
    this.client = message.client;
  }

  public async init() {
    await this.resolveParams();

    if (this.message.channel.type === "dm") {
      this.guild = undefined;
      return (this.isDm = true);
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
  }

  private async resolveParams() {
    this.params = await this.commandHandle.checkAndParse(this);
  }
}
