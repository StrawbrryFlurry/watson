import { CommandArguments, CommandPipeline, CommandRoute } from '@watsonjs/common';
import { Guild, Message, PermissionString, TextChannel, User } from 'discord.js';

import { CommandRouteHost } from '../../routes';
import { CommandParser } from '../parser';
import { CommandArgumentsHost } from './command-argument-host';

export class CommandPipelineHost implements CommandPipeline {
  public argumentHost: CommandArgumentsHost;
  public route: CommandRouteHost;
  public message: Message;
  public command: string;
  public prefix: string;
  public isFromGuild: boolean;
  public userPermissions: Set<PermissionString>;

  private parser: CommandParser;

  constructor(route: CommandRouteHost) {
    this.route = route;
    this.argumentHost = new CommandArgumentsHost(route);
  }

  getUser(): User {
    return this.message.author;
  }
  getCommand(): CommandRoute {
    throw new Error("Method not implemented.");
  }

  public invokeFromMessage(message: Message) {
    this.message = message;

    this.argumentHost.parseMessage(message);
  }

  getArguments(): CommandArguments {
    return this.argumentHost;
  }

  getMessage(): Message {
    throw new Error("Method not implemented.");
  }

  getChannel(): TextChannel {
    throw new Error("Method not implemented.");
  }

  getGuild(): Guild {
    throw new Error("Method not implemented.");
  }

  getContent(): string {
    throw new Error("Method not implemented.");
  }
}
