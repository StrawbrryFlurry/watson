import { CommandPipeline, CommandPrefix, ContextType, TextBasedChannel } from '@watsonjs/common';
import { Guild, GuildMember, Message, User, VoiceChannel } from 'discord.js';

import { CommandRoute } from '../../router';
import { CommandArgumentsHost } from './command-argument-host';

export interface ParsedCommandData {
  command: string;
  prefix: CommandPrefix;
}

export class CommandPipelineHost implements CommandPipeline {
  public argumentHost: CommandArgumentsHost;
  public route: CommandRoute;
  public message: Message;
  public command: string;
  public prefix: CommandPrefix;
  public isFromGuild: boolean;
  public guildMember: GuildMember;
  public user: User;
  public channel: TextBasedChannel;
  public readonly contextType: ContextType = "command";

  constructor(command: string, prefix: CommandPrefix, route: CommandRoute) {
    this.route = route;
    this.command = command;
    this.prefix = prefix;
    this.argumentHost = new CommandArgumentsHost(route);
  }

  public async invokeFromMessage(message: Message) {
    this.message = message;
    await this.assingSelf();
    await this.argumentHost.parseMessage(message);
  }

  private async assingSelf() {
    const { guild, author, channel } = this.message;
    this.isFromGuild = !!guild;
    this.user = author;
    this.channel = channel;

    if (this.isFromGuild) {
      this.guildMember = await guild.members.fetch(this.message);
    }
  }

  getMessage(): Message {
    return this.message;
  }

  getChannel(): TextBasedChannel {
    return this.message.channel;
  }

  getVoiceChannel(): VoiceChannel | null {
    return this.guildMember.voice.channel;
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

  getArguments(): CommandArgumentsHost {
    return this.argumentHost;
  }

  getCommand(): CommandRoute {
    return this.route;
  }

  getEvent<T extends unknown[] = unknown[]>(): T {
    return [this.message] as T;
  }
}
