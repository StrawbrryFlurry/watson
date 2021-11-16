import { ApplicationCommandRoute, ContextType, ExecutionContext, InteractionPipeline, isNil } from '@watsonjs/common';
import { Injector } from '@watsonjs/core';
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

import { PipelineBaseImpl } from './pipeline-base';

export class InteractionPipelineImpl
  extends PipelineBaseImpl<InteractionPipeline, ApplicationCommandRoute>
  implements InteractionPipeline
{
  public command: string;

  public user: User;
  public guild: Guild | null;
  public channel: TextBasedChannels | null;

  public isFromGuild: boolean;

  public route: ApplicationCommandRoute;
  public interaction: CommandInteraction | ContextMenuInteraction;

  public readonly contextType: ContextType = "interaction";

  public async getGuildMember(): Promise<GuildMember | null> {
    if (!this.isFromGuild) {
      return null;
    }

    return this.guild!.members.fetch(this.user);
  }

  public async getVoiceChanel(): Promise<VoiceChannel | StageChannel | null> {
    const { voice } = (await this.getGuildMember()) ?? {};

    if (isNil(voice)) {
      return null;
    }

    return voice.channel;
  }

  constructor(
    route: ApplicationCommandRoute,
    injector: Injector,
    eventData: CommandInteraction | ContextMenuInteraction
  ) {
    super(route, injector, "interaction", eventData);
    this.interaction = eventData;
  }

  public static async create(
    route: ApplicationCommandRoute,
    ctx: ExecutionContext,
    interaction: CommandInteraction | ContextMenuInteraction
  ): Promise<InteractionPipeline> {
    const { guildId, channel, guild, user } = interaction;
    const interactionRef = new InteractionPipelineImpl(route, ctx, interaction);

    interactionRef.user = user;
    interactionRef.channel = channel;
    interactionRef.guild = guild;
    interactionRef.isFromGuild = !!guildId;

    return interactionRef;
  }
}
