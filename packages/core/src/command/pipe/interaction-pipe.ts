import {
  ApplicationCommandRoute,
  ChannelCtx,
  ClientCtx,
  ContextType,
  ExecutionContext,
  FindMemberInq,
  InteractionPipeline,
  isNil,
} from '@watsonjs/common';
import { ContextBindingFactory, ContextInjector, Injector } from '@watsonjs/core';
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
  extends PipelineBaseImpl<
    CommandInteraction | ContextMenuInteraction,
    ApplicationCommandRoute
  >
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

  protected _injector: Injector;

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
    eventData: CommandInteraction | ContextMenuInteraction
  ) {
    super(route, "interaction", eventData);
    this.interaction = eventData;
  }

  public static async create(
    route: ApplicationCommandRoute,
    injector: Injector,
    interaction: CommandInteraction | ContextMenuInteraction
  ): Promise<InteractionPipeline> {
    const { guildId, channel, guild, user } = interaction;
    const interactionRef = new InteractionPipelineImpl(route, interaction);
    const ctx = await interactionRef.createExecutionContext(injector);

    interactionRef.user = user;
    interactionRef.channel = channel;
    interactionRef.guild = guild;
    interactionRef.isFromGuild = !!guildId;
    interactionRef._injector = ctx;

    return interactionRef;
  }

  protected createExecutionContext(
    moduleInj: Injector
  ): Promise<ExecutionContext> {
    const bindFactory: ContextBindingFactory = (bind) => {
      bind(ClientCtx, this.interaction.client);
      bind(ChannelCtx, this.channel);
      bind(FindMemberInq, (name: string, fuzzy = false) => {
        return this.guild?.members.cache;
      });
    };

    const inj = new ContextInjector(moduleInj, this, bindFactory);
    return inj.get(ExecutionContext);
  }
}
