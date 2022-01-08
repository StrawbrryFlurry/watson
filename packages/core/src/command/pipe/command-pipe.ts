import { ContextBindingFactory, ContextProviderFactory } from '@core/di';
import {
  CommandAst,
  CommandPipeline,
  CommandRoute,
  ContextType,
  MessageCtx,
  MessageMatchResult,
  Prefix,
  PrefixRef,
} from '@watsonjs/common';
import { Injector } from '@watsonjs/di';
import { Guild, GuildMember, Message, StageChannel, TextBasedChannels, User, VoiceChannel } from 'discord.js';

import { PipelineBaseImpl } from './pipeline-base';

export class CommandPipelineImpl
  extends PipelineBaseImpl<Message, CommandRoute>
  implements CommandPipeline
{
  public route: CommandRoute;
  public command: string;
  public prefix: Prefix;
  public user: User;
  public guild: Guild | null;
  public channel: TextBasedChannels;

  public message: Message;
  public match: MessageMatchResult;
  public ast?: CommandAst;

  public get prefixText() {
    return this.match.prefixString;
  }

  constructor(
    route: CommandRoute,
    message: Message,
    match: MessageMatchResult
  ) {
    super(route, ContextType.command, message);
    const { guild, author, channel } = message;
    this.route = route;
    this.guild = guild;
    this.user = author;
    this.match = match;
    this.channel = channel;
    this.message = message;
  }

  public async getVoiceChannel(): Promise<VoiceChannel | StageChannel | null> {
    const { voice } = (await this.getGuildMember()) ?? {};
    return voice?.channel ?? null;
  }

  public async getGuildMember(): Promise<GuildMember | null> {
    if (!this.isFromGuild()) {
      return null;
    }

    return this.guild.members.fetch(this.user);
  }

  public static async create(
    route: CommandRoute,
    injector: Injector,
    message: Message,
    match: MessageMatchResult
  ): Promise<CommandPipeline> {
    const pipeline = new CommandPipelineImpl(route, message, match);
    await pipeline.createExecutionContext(injector);
    return pipeline;
  }

  getMessage(): Message {
    return this.message;
  }

  getChannel(): TextBasedChannels {
    return this.message.channel;
  }

  getGuild(): Guild | null {
    return this.message.guild;
  }

  getContent(): string {
    return this.message.content;
  }

  getUser(): User {
    return this.message.author;
  }

  getCommand(): CommandRoute {
    return this.route;
  }

  getEvent<T extends unknown = unknown[]>(): T {
    return [this.message] as T;
  }

  protected async createExecutionContext(injector: Injector): Promise<void> {
    const inquirableFactory = new ContextProviderFactory(injector);
    const bindingFactory: ContextBindingFactory = (bind) => {
      inquirableFactory.bindGlobals(this, bind);
      bind(MessageCtx, this.message);
      bind(PrefixRef, () => this.prefixText, true);
    };

    await this.createAndBindInjector(injector, bindingFactory);
  }
}
