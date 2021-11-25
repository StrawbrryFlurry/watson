import {
  CommandPipeline,
  FindChannelInq,
  FindMemberInq,
  FindRoleInq,
  InteractionPipeline,
  isNil,
  MessageSendable,
  PipelineBase,
  PromptInq,
  Providable,
  UnauthorizedException,
} from '@watsonjs/common';
import { CachedManager, Channel, GuildMember, Role, TextChannel } from 'discord.js';

import { Injector } from '..';
import { ParseMessageSendable } from '../lifecycle/parse-messagesendable';

type UserBasedPipeline = InteractionPipeline | CommandPipeline;
type InquirableBundle = [Providable, Function] | [Providable, Function][];

export class InquirableFactory {
  constructor(private _injector: Injector) {}

  /**
   * Creates the default global inquirables
   * available through DI in router methods
   * and their constructors.
   */
  public createGlobals(pipeline: PipelineBase): InquirableBundle {
    const inquirables = [];

    inquirables.push(...this._createFindInq(pipeline as UserBasedPipeline));
    inquirables.push(this._createPromptInq(pipeline as UserBasedPipeline));

    return [];
  }

  private _createPromptInq(pipeline: UserBasedPipeline): InquirableBundle {
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

    return [PromptInq, PROMPT_INQ];
  }

  private _createFindInq(pipeline: UserBasedPipeline): InquirableBundle {
    if (!pipeline.isFromGuild()) {
      return this._createNullInquirable(
        FindChannelInq,
        FindRoleInq,
        FindMemberInq
      );
    }

    const { guild } = pipeline;

    const findInManager = <T>(
      manager: CachedManager<string, T, any> | undefined,
      name: string,
      fuzzy: boolean = false,
      findCb: (e: T) => boolean
    ) => {
      if (isNil(manager)) {
        return null;
      }

      if (fuzzy) {
        return manager.cache.find(findCb as any);
      }

      return manager.resolve(name);
    };

    const ROLE_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<Role>(guild?.roles, name, fuzzy, (role) =>
        role.name.includes(name)
      );

    const CHANNEL_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<Channel>(guild?.channels, name, fuzzy, (channel) =>
        (channel as TextChannel).name?.includes(name)
      );

    const MEMBER_INQ = (name: string, fuzzy?: boolean) =>
      findInManager<GuildMember>(
        guild?.members,
        name,
        fuzzy,
        (member) =>
          member.nickname?.includes(name) || member.displayName.includes(name)
      );

    return [
      [FindChannelInq, CHANNEL_INQ],
      [FindRoleInq, ROLE_INQ],
      [FindMemberInq, MEMBER_INQ],
    ];
  }

  private _createNullInquirable(...providers: Providable[]): InquirableBundle {
    return providers.map((provider) => [
      provider,
      () => null,
    ]) as InquirableBundle;
  }
}
