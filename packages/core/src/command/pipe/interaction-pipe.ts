import { ApplicationCommandRoute, ContextType, InteractionCtx, InteractionPipeline } from '@watsonjs/common';
import { ContextBindingFactory, Injector } from '@watsonjs/core';
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

import { ContextProviderFactory } from '../../di/context-provider-factory';
import { PipelineBaseImpl } from './pipeline-base';

export class InteractionPipelineImpl
  extends PipelineBaseImpl<
    CommandInteraction | ContextMenuInteraction,
    ApplicationCommandRoute
  >
  implements InteractionPipeline
{
  public command: string | null;
  public user: User;
  public guild: Guild | null;
  public channel: TextBasedChannels | null;

  public isReplied = false;

  public route: ApplicationCommandRoute;
  public interaction: CommandInteraction | ContextMenuInteraction;

  public async getGuildMember(): Promise<GuildMember | null> {
    if (!this.isFromGuild()) {
      return null;
    }

    return this.guild.members.fetch(this.user);
  }

  public async getVoiceChannel(): Promise<VoiceChannel | StageChannel | null> {
    const { voice } = (await this.getGuildMember()) ?? {};
    return voice?.channel ?? null;
  }

  /**
   * @hideconstructor
   * @ignore use `InteractionPipelineImpl.create` instead
   */
  private constructor(
    route: ApplicationCommandRoute,
    interaction: CommandInteraction | ContextMenuInteraction
  ) {
    super(route, ContextType.interaction, interaction);
    const { guildId, channel, guild, user } = interaction;
    this.user = user;
    this.channel = channel;
    this.guild = guild;
    this.interaction = interaction;
    this._guildId = guildId;
    this.command = interaction.command?.id ?? null;
  }

  public static async create(
    route: ApplicationCommandRoute,
    injector: Injector,
    interaction: CommandInteraction | ContextMenuInteraction
  ): Promise<InteractionPipeline> {
    const interactionRef = new InteractionPipelineImpl(route, interaction);
    await interactionRef.createExecutionContext(injector);
    return interactionRef;
  }

  protected async createExecutionContext(moduleInj: Injector): Promise<void> {
    const inquirableFactory = new ContextProviderFactory(moduleInj);
    const bindingFactory: ContextBindingFactory = (bind) => {
      bind(InteractionCtx, this.interaction);
      inquirableFactory.bind(this, bind);
    };

    await this.createAndBindInjector(moduleInj, bindingFactory);
  }
}
