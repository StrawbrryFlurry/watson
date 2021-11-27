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

import { CommandAst, MessageMatchResult, Prefix } from '../command';
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
   * The guild in which the message was sent
   * - `null` if the message was sent in a dm
   */
  guild: Guild | null;
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
  /**
   * The prefix that initially
   * matched a message to create
   * this pipeline.
   */
  match: MessageMatchResult;
  message: Message;
  /**
   * The route that matched with
   * the event emitted.
   */
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
   * - `null` if the user is not in a voice channel
   */
  getVoiceChannel(): Promise<VoiceChannel | StageChannel | null>;
  /**
   * Returns the guild member from which the message
   * was sent
   * - `null` if the message was sent in a DM
   */
  getGuildMember(): Promise<GuildMember | null>;
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
