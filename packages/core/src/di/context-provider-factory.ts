import { ContextInjector } from '@core/di';
import { ParseMessageSendable } from '@core/lifecycle';
import {
  ChannelCtx,
  CommandPipeline,
  ContextType,
  DeferReplyInq,
  FindChannelInq,
  FindMemberInq,
  FindRoleInq,
  FollowUpInq,
  GuildCtx,
  InteractionPipeline,
  isNil,
  isString,
  MessageCtx,
  MessageSendable,
  PipelineBase,
  PromptInq,
  ReplyInq,
  SendInq,
  TextBasedChannel,
  UnauthorizedException,
  VoiceChannelCtx,
} from '@watsonjs/common';
import { Injector, Providable } from '@watsonjs/di';
import { CachedManager, Channel, ChannelResolvable, Guild, GuildMember, Message, Role, TextChannel } from 'discord.js';

type UserBasedPipeline = InteractionPipeline | CommandPipeline;
type ProviderBundle = [Providable, any][];

export class ContextProviderFactory {
  constructor(private _injector: Injector) {}

  /**
   * Creates the default global providers
   * available through DI in router methods
   * and their constructors.
   */
  public createGlobals(pipeline: PipelineBase): ProviderBundle {
    const providers: ProviderBundle = [];
    const add = (bundle: ProviderBundle) => providers.push(...bundle);

    add([[GuildCtx, pipeline.isFromGuild() ? pipeline.guild : null]]);
    add([[VoiceChannelCtx, (<UserBasedPipeline>pipeline).getVoiceChannel()]]);
    add([[MessageCtx, (<CommandPipeline>pipeline).message ?? null]]);
    add([[ChannelCtx, (<UserBasedPipeline>pipeline).channel ?? null]]);

    add(this._createFindInq(<UserBasedPipeline>pipeline));
    add(this._createPromptInq(<UserBasedPipeline>pipeline));
    add(this._createSendInq(pipeline));

    if (pipeline.contextType === ContextType.interaction) {
      add(this._createInteractionInq(pipeline as InteractionPipeline));
    }

    return providers;
  }

  /**
   * Binds all global providers to
   * a `providerMap`. Used to assign
   * providers when creating
   * a provider map for a {@link ContextInjector}.
   */
  public bindGlobals(
    pipeline: PipelineBase,
    bindFn: (provide: Providable, value: any) => void
  ): void {
    const globals = this.createGlobals(pipeline);

    for (let i = 0; i < globals.length; i++) {
      const [provider, inqFn] = globals[i];
      bindFn(provider, inqFn);
    }
  }

  private _createInteractionInq(pipeline: InteractionPipeline): ProviderBundle {
    const { interaction } = pipeline;

    const REPLY_INQ: ReplyInq = async (
      message: MessageSendable
    ): Promise<void> => {
      if (pipeline.isReplied === true) {
        throw "Already replied to pipeline";
      }

      await interaction.reply(ParseMessageSendable(message));
      pipeline.isReplied = true;
    };

    const FOLLOW_UP_INQ: FollowUpInq = async (
      message: MessageSendable
    ): Promise<Message> => {
      return (await interaction.followUp(
        ParseMessageSendable(message)
      )) as Message;
    };

    const DEFER_REPLY_INQ: DeferReplyInq = async (
      ephemeral = false
    ): Promise<void> => {
      pipeline.isDeferred = true;
      interaction.deferReply({ ephemeral });
    };

    return [
      [ReplyInq, REPLY_INQ],
      [FollowUpInq, FOLLOW_UP_INQ],
      [DeferReplyInq, DEFER_REPLY_INQ],
    ];
  }

  private _createSendInq(pipeline: PipelineBase): ProviderBundle {
    const SEND_INQ: SendInq = async (
      message: MessageSendable,
      channel?: ChannelResolvable,
      guild?: Guild
    ): Promise<Message> => {
      if (isNil(channel)) {
        if (isNil((<UserBasedPipeline>pipeline).channel)) {
          throw "Can't send message to the pipeline channel as the event does not contain a valid channel. Specify a channel in SendInq(<message>, <channel>!)";
        }

        channel = (<UserBasedPipeline>pipeline).channel! as TextBasedChannel;
      }

      if (isString(channel)) {
        if (isNil(guild)) {
          throw `Can't resolve channel ${channel}. Specify a guild in SendInq(<message>, <channel>, <guild>!)`;
        }

        channel = <TextBasedChannel>await guild.channels.fetch(channel);

        if (isNil(channel)) {
          throw `Could not find channel ${channel} in guild ${guild.name}`;
        }
      }

      return (<TextBasedChannel>channel).send(ParseMessageSendable(message));
    };

    return [[SendInq, SEND_INQ]];
  }

  private _createPromptInq(pipeline: UserBasedPipeline): ProviderBundle {
    const PROMPT_INQ: PromptInq = async (message: MessageSendable) => {
      const { user, channel } = pipeline;

      if (isNil(channel)) {
        throw "Can't use `PromptInquirable` for commands that were not run in a text based channel. Use `SendInq` instead.";
      }

      if (pipeline.isFromGuild()) {
        const canSend = pipeline.channel
          .permissionsFor(user)
          ?.has("SEND_MESSAGES");

        if (isNil(canSend) || !canSend) {
          throw new UnauthorizedException(
            `The user who has run this command doesn't have permission to send messages in this channel`
          );
        }
      }

      await channel.send(ParseMessageSendable(message));
      const response = await channel.awaitMessages({
        filter: (message) => message.author.id === user.id,
        max: 1,
      });

      return response.first() ?? null;
    };

    return [[PromptInq, PROMPT_INQ]];
  }

  private _createFindInq(pipeline: UserBasedPipeline): ProviderBundle {
    if (!pipeline.isFromGuild()) {
      return this._createNullInquirable(
        FindChannelInq,
        FindRoleInq,
        FindMemberInq
      );
    }

    const { guild } = pipeline;

    const findInManager = async <T>(
      manager: CachedManager<string, T, any> | undefined,
      name: string,
      fuzzy: boolean = false,
      findCb: (e: T) => boolean
    ): Promise<T | T[] | null> => {
      if (isNil(manager)) {
        return null;
      }

      if (fuzzy) {
        return manager.cache.find(findCb) ?? null;
      }

      return manager.resolve(name);
    };

    const ROLE_INQ: FindRoleInq = (name: string, fuzzy?: boolean) =>
      findInManager<Role>(guild?.roles, name, fuzzy, (role) =>
        role.name.includes(name)
      ) as any;

    const CHANNEL_INQ: FindChannelInq = (name: string, fuzzy?: boolean) =>
      findInManager<Channel>(guild?.channels, name, fuzzy, (channel) =>
        (<TextChannel>channel).name?.includes(name)
      ) as any;

    const MEMBER_INQ: FindMemberInq = (name: string, fuzzy?: boolean) =>
      findInManager<GuildMember>(
        guild?.members,
        name,
        fuzzy,
        (member) =>
          member.nickname?.includes(name) || member.displayName.includes(name)
      ) as any;

    return [
      [FindChannelInq, CHANNEL_INQ],
      [FindRoleInq, ROLE_INQ],
      [FindMemberInq, MEMBER_INQ],
    ];
  }

  private _createNullInquirable(...providers: Providable[]): ProviderBundle {
    return <ProviderBundle>providers.map((provider) => [provider, () => null]);
  }
}

/** @jsdoc-ref */
declare const _: ContextInjector;
