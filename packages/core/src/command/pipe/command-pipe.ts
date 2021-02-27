import { CommandPipeline } from '@watsonjs/common';
import { Channel, Guild, GuildMember, Message, User } from 'discord.js';

import { CommandRouteHost } from '../../router';
import { CommandPrefixHost } from '../../router/command/command-prefix-host';
import { CommandArgumentsHost } from './command-argument-host';

export class CommandPipelineHost implements CommandPipeline {
  public argumentHost: CommandArgumentsHost;
  public route: CommandRouteHost;
  public message: Message;
  public command: string;
  public prefix: CommandPrefixHost;
  public isFromGuild: boolean;
  public guildMember: GuildMember;

  constructor(
    command: string,
    prefix: CommandPrefixHost,
    route: CommandRouteHost
  ) {
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
    const { guild } = this.message;
    this.isFromGuild = !!guild;

    if (this.isFromGuild) {
      this.guildMember = await guild.members.fetch(this.message);
    }
  }

  getMessage(): Message {
    return this.message;
  }

  getChannel(): Channel {
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
}
