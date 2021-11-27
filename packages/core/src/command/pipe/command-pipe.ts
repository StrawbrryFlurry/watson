import { CommandAst, CommandPipeline, CommandRoute, ContextType, MessageMatchResult, Prefix } from '@watsonjs/common';
import { ContextBindingFactory } from '@watsonjs/core';
import { Guild, GuildMember, Message, StageChannel, TextBasedChannels, User, VoiceChannel } from 'discord.js';

import { Injector } from '../../di/injector';
import { PipelineBaseImpl } from './pipeline-base';

export interface ParsedCommandData {
  command: string;
  prefix: Prefix;
}

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

  public async create(
    route: CommandRoute,
    injector: Injector,
    message: Message,
    match: MessageMatchResult
  ): Promise<CommandPipeline> {
    const pipeline = new CommandPipelineImpl(route, message, match);
    await pipeline.createExecutionContext(injector, message);
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

  protected async createExecutionContext(
    moduleInj: Injector,
    message: Message
  ): Promise<void> {
    const bindingFactory: ContextBindingFactory = (bind) => {};

    await this.createAndBindInjector(moduleInj, bindingFactory);
  }
}
