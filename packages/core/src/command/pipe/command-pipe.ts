import { CommandPipeline, CommandPrefix, ContextType, TextBasedChannel } from '@watsonjs/common';
import { Guild, GuildMember, Message, User } from 'discord.js';

import { CommandRouteHost } from '../../router';
import { CommandArgumentsHost } from './command-argument-host';

export class CommandPipelineHost implements CommandPipeline {
  public argumentHost: CommandArgumentsHost;
  public route: CommandRouteHost;
  public message: Message;
  public command: string;
  public prefix: CommandPrefix;
  public isFromGuild: boolean;
  public guildMember: GuildMember;
  public user: User;
  public channel: TextBasedChannel;
  public readonly contextType: ContextType = "command";

  constructor(command: string, prefix: CommandPrefix, route: CommandRouteHost) {
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

  getGuild(): Guild {
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

  getCommand(): CommandRouteHost {
    return this.route;
  }

  getEvent<T extends unknown[] = unknown[]>(): T {
    return [this.message] as T;
  }
}
