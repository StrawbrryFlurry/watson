import { CommandAst, CommandPipeline, CommandRoute, ContextType, Prefix } from '@watsonjs/common';
import { Guild, GuildMember, Message, StageChannel, TextBasedChannels, User, VoiceChannel } from 'discord.js';

export interface ParsedCommandData {
  command: string;
  prefix: Prefix;
}

export class CommandPipelineImpl implements CommandPipeline {
  public route: CommandRoute;
  public message: Message;
  public command: string;
  public prefix: Prefix;
  public isFromGuild: boolean;
  public guildMember: GuildMember;
  public user: User;
  public channel: TextBasedChannels;
  public readonly contextType: ContextType = "command";

  public ast?: CommandAst;

  constructor(command: string, prefix: Prefix, route: CommandRoute) {
    this.route = route;
    this.command = command;
    this.prefix = prefix;
  }

  getVoiceChannel(): VoiceChannel | StageChannel | null {
    throw new Error("Method not implemented.");
  }

  getInjector<T = any>(): T {
    throw new Error("Method not implemented.");
  }

  public async invokeFromMessage(message: Message) {
    this.message = message;
    await this.assingSelf();
  }

  private async assingSelf() {
    const { guild, author, channel } = this.message;
    this.isFromGuild = !!guild;
    this.user = author;
    this.channel = channel;

    if (this.isFromGuild) {
      this.guildMember = await guild!.members.fetch(this.message);
    }
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

  getEvent<T extends unknown[] = unknown[]>(): T {
    return [this.message] as T;
  }
}
