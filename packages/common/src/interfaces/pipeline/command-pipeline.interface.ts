import { DMChannel, Guild, GuildMember, Message, NewsChannel, TextChannel, User, VoiceChannel } from 'discord.js';

import { CommandArgumentsHost, CommandPrefix } from '../command';
import { CommandRoute } from '../router';
import { PipelineBase } from './pipeline-base.interface';

export type TextBasedChannel = TextChannel | DMChannel | NewsChannel;

export interface CommandPipeline extends PipelineBase {
  /**
   * The command name used by the user
   */
  command: string;
  /**
   * The prefix used by the user
   */
  prefix: CommandPrefix;
  /**
   * Whether the message is from a guild or not
   */
  isFromGuild: boolean;
  /**
   * The resolved guild member object if
   * the message originated form a guild
   */
  guildMember: GuildMember;
  /**
   * The user from whom the message was sent
   */
  user: User;
  /**
   * The channel from which the message was sent
   */
  channel: TextBasedChannel;
  /**
   * Returns the `CommandArgumentsHost` which
   * holds arguments collected for this context
   */
  getArguments(): CommandArgumentsHost;
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
  getChannel(): TextBasedChannel;
  /**
   * Returns the voice cannel the user is currently in
   * Returns `null` if the user is not in a voice channel
   */
  getVoiceChannel(): VoiceChannel | null;
  /**
   * Returns the guild in which the message was sent
   * Returns `null` if the message was sent in a dm
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
