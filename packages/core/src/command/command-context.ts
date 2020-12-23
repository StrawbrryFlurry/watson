import { DMChannel, Guild, Message, NewsChannel, PermissionString, Role, TextChannel, User } from 'discord.js';

import { CommandHandle } from './command-handle';

/**
 * Execution context of a command
 */
export class CommandContext {
  public message: Message;
  public author: User;
  public params: unknown[];
  public userRoles: Set<Role>;
  public userRoleNames: Set<string>;
  public userPermissions: Set<PermissionString>;
  public commandHandle: CommandHandle;
  public channel: TextChannel | DMChannel | NewsChannel;
  public guild: Guild;

  public isDm: boolean;

  constructor(message: Message) {
    this.message = message;
    this.channel = message.channel;
    this.author = message.author;
  }

  public async init() {
    await this.resolveParams();

    if (this.message.channel.type === "dm") {
      return (this.isDm = true);
    }

    this.isDm = false;

    Object.entries(this.message.member.permissions.serialize()).forEach(
      ([permission, hasPermission]) => {
        if (!!hasPermission) {
          this.userPermissions.add(permission as PermissionString);
        }
      }
    );

    this.message.member.roles.cache.forEach((role) => {
      this.userRoleNames.add(role.name);
      this.userRoles.add(role);
    });
  }

  private async resolveParams() {
    this.params = await this.commandHandle.checkAndParse(this);
  }
}
