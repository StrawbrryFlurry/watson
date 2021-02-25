import { Guild, Message, PermissionString, TextChannel, User } from 'discord.js';

import { CommandArguments } from '../command';
import { CommandRoute } from '../routing';

export interface CommandPipeline {
  /**
   * The command name used by the user
   */
  command: string;
  /**
   * The prefix used by the user
   */
  prefix: string;
  /**
   * Whether the message is from a guild or not
   */
  isFromGuild: boolean;
  /**
   * Set of permissions of the author
   */
  userPermissions: Set<PermissionString>;
  /**
   * Returns the `CommandArgumentsHost` which
   * holds arguments collected for this context
   */
  getArguments(): CommandArguments;
  /**
   * Returns the message which used the command
   */
  getMessage(): Message;
  /**
   * Returns the author of the message.
   */
  getUser(): User;
  /**
   * Returns the text channel in which this command was used
   */
  getChannel(): TextChannel;
  /**
   * Returns the guild in which the message was sent
   * @returns `null` if the message was sent in a dm
   */
  getGuild(): Guild | null;
  /**
   * Returns the raw message content
   */
  getContent(): string;
  /**
   * Returns the command route in which this command
   * was registered in
   */
  getCommand(): CommandRoute;
}
