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

import { ApplicationCommandRoute } from '..';
import { PipelineBase } from './pipeline-base.interface';

export interface InteractionPipeline extends PipelineBase {
  /**
   * The command name used by the user
   */
  command: string;
  /**
   * Whether the interaction is from a guild or not
   */
  isFromGuild: boolean;
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
   * The resolved guild member object if
   * the message originated form a guild
   */
  getGuildMember(): Promise<GuildMember | null>;
  /**
   * The voice cannel the user is currently in
   * - `null` if the user is not currently in a voice channel.
   */
  getVoiceChanel(): Promise<VoiceChannel | StageChannel | null>;
}
