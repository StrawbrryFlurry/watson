import { CommandContextData } from '@watsonjs/common';
import { Channel, Message, PermissionString, Role } from 'discord.js';

import { CommandConfiguration } from './command-configuration-host';

interface IMessageParts {
  command: string;
  prefix: string;
  rest: string;
}

export const GUILD_CHANNEL_TYPES = [
  "text",
  "voice",
  "category",
  "news",
  "store",
];

export class CommandParser {
  constructor(private config: CommandConfiguration) {}

  public async parse(message: Message): Promise<CommandContextData> {
    const { content, channel, guild, author: user } = message;
    const { command, prefix, rest } = this.extractMessageParts(content);
    const isFromGuild = this.isFromGuild(channel);
    const params = await this.parseArguments(message, rest);
    const {
      userPermissions,
      userRoleNames,
      userRoles,
    } = await this.parseUserData(message);

    return {
      messageContent: content,
      channel,
      command,
      guild,
      isFromGuild,
      params,
      prefix: prefix,
      user,
      userPermissions,
      userRoleNames,
      userRoles,
    };
  }

  // public matchesPrefix(content: string) {
  //   return this.config.hasPrefix()
  //     ? content.startsWith(this.config.prefix)
  //     : true;
  // }

  public matchesCommand(command: string) {
    command = this.config.caseSensitive ? command.toLowerCase() : command;
    return (
      command === this.config.name.toLowerCase() ||
      this.config.alias.some((e) => e.toLowerCase() === command)
    );
  }

  public extractMessageParts(messageContent: string): IMessageParts {
    let prefix = "";
    let withoutPrefix = messageContent;
    let command: string;
    let rest: string;

    // if (this.config.hasPrefix()) {
    //   prefix = this.config.prefix;
    //   withoutPrefix = messageContent.replace(this.config.prefix, "");
    // }

    [command, ...rest as any] = withoutPrefix.split("");
    rest = (rest as any).join("");

    return {
      command,
      prefix,
      rest,
    };
  }

  private async parseUserData({ guild, author: user, channel }: Message) {
    if (!this.isFromGuild(channel)) {
      return {
        userRoles: undefined,
        userRoleNames: undefined,
        userPermissions: undefined,
      };
    }

    const member = await guild.members.fetch(user.id);
    const userRoles = new Set<Role>();
    const userRoleNames = new Set<string>();
    const userPermissions = new Set<PermissionString>();

    member.roles.cache.forEach((role) => {
      userRoles.add(role);
      userRoleNames.add(role.name);
    });

    member.permissions.toArray().forEach((perm) => userPermissions.add(perm));

    return {
      userRoles,
      userRoleNames,
      userPermissions,
    };
  }

  private isFromGuild(channel: Channel) {
    return GUILD_CHANNEL_TYPES.includes(channel.type);
  }

  private async parseArguments(
    { guild, channel, author }: Message,
    content: string
  ) {
    if (!this.config.hasParams()) {
      return undefined;
    }

    let params = {};
  }
}
