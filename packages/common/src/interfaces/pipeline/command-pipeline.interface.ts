import {
  DMChannel,
  Guild,
  GuildMember,
  Message,
  NewsChannel,
  StageChannel,
  TextBasedChannels,
  TextChannel,
  User,
  VoiceChannel,
} from 'discord.js';

import { CommandAst, Prefix } from '../command';
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
  prefix: Prefix;
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
  channel: TextBasedChannels;
  /**
   * The parsed AST of this command
   */
  ast?: CommandAst;
  route: CommandRoute;
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
  getChannel(): TextBasedChannels;
  /**
   * Returns the voice cannel the user is currently in
   * Returns `null` if the user is not in a voice channel
   */
  getVoiceChannel(): VoiceChannel | StageChannel | null;
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
