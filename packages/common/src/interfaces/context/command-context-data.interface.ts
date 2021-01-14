import { DMChannel, NewsChannel, PermissionString, Role, TextChannel, User } from 'discord.js';
import { CommandArgumentType } from 'enums';

import { ContextData } from './context-data.interface';

export interface CommandParam<T = any> {
  type: CommandArgumentType;
  value: T;
}

export interface CommandContextData extends ContextData {
  /**
   * Command arguments that were parsed from the original message
   * @key The name of the param as specified in the command configuration
   * @value The parsed command value
   */
  params: {
    [key: string]: CommandParam;
  };
  /**
   * The user whose message event triggered this command
   */
  user: User;
  /**
   * All roles of a user
   * `undefined` if the command was used in a DM.
   */
  userRoles: Set<Role>;
  /**
   * The name of all roles
   * `undefined` if the command was used in a DM.
   */
  userRoleNames: Set<string>;
  /**
   * The permissions the user has in a guild
   * `undefined` if the command was run in a DM.
   */
  userPermissions: Set<PermissionString>;
  /**
   * The raw message content.
   */
  messageContent: string;
  /**
   * The command name this context belongs to.
   * If an alias was used, it will be set as the name.
   */
  command: string;
  /**
   * The prefix used for this command.
   */
  prefix: string;
  /**
   * The channel class this command was used in.
   */
  channel: TextChannel | DMChannel | NewsChannel;
  /**
   * Whether the message is from a guild channel or not.
   */
  isFromGuild: boolean;
}
