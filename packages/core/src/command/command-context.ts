import { Message, PermissionString, Role, TextChannel } from 'discord.js';

import { CommandHandle } from './command-handle';

/**
 * Execution context of a command
 */
export class CommandContext {
  public message: Message;
  public params: unknown;
  public userRoles: Set<Role>;
  public userRoleNames: Set<string>;
  public userPermissions: Set<PermissionString>;
  public commandHandle: CommandHandle;
  public channel: TextChannel;
}
