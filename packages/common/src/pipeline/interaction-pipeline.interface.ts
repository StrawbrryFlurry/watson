import { ApplicationCommandRoute } from '@common/router';
import {
  CommandInteraction,
  ContextMenuInteraction,
  Guild,
  GuildMember,
  StageChannel,
  TextBasedChannels,
  User,
  VoiceChannel,
} from 'discord.js';

import { PipelineBase } from './pipeline-base.interface';

export interface InteractionPipeline extends PipelineBase {
  /**
   * The command name used by the user
   */
  command: string | null;
  /**
   * The user from whom the message was sent
   */
  user: User;
  /**
   * The guild in which the interaction was sent
   * - `null` if the interaction was sent in a dm
   */
  guild: Guild | null;
  /**
   * The channel from which the message was sent
   */
  channel: TextBasedChannels | null;
  /**
   * The parsed AST of this command
   */
  route: ApplicationCommandRoute;
  /**
   * The raw interaction.
   */
  interaction: CommandInteraction | ContextMenuInteraction;
  /**
   * If you reply to an interaction using
   * `ReplyInq`, this is set to true.
   * If true, the message returned from the
   * interaction handler will be sent as
   * a regular message to the interaction
   * source channel.
   */
  isReplied: boolean;
  /**
   * If you reply to the interaction
   * using `DeferInq`, this is set to
   * true.
   */
  isDeferred: boolean;
  /**
   * The resolved guild member object if
   * the message originated form a guild
   */
  getGuildMember(): Promise<GuildMember | null>;
  /**
   * The voice cannel the user is currently in
   * - `null` if the user is not currently in a voice channel.
   */
  getVoiceChannel(): Promise<VoiceChannel | StageChannel | null>;
}
