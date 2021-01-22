import {
  BadArgumentException,
  CHANNEL_MENTION_REGEXP,
  CommandArgumentType,
  CommandContextData,
  ICommandParam,
  isNil,
  ROLE_MENTION_REGEXP,
  USER_MENTION_REGEXP,
} from '@watsonjs/common';
import * as dayjs from 'dayjs';
import { Channel, Message, PermissionString, Role } from 'discord.js';

import { CommandConfiguration } from './command-config';

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

  public matchesPrefix(content: string) {
    return this.config.hasPrefix()
      ? content.startsWith(this.config.prefix)
      : true;
  }

  public matchesCommand(command: string) {
    command = this.config.caseSensitive ? command.toLowerCase() : command;
    return (
      command === this.config.name ||
      this.config.alias.some((e) => e.toLowerCase() === command)
    );
  }

  public extractMessageParts(messageContent: string): IMessageParts {
    let prefix = "";
    let withoutPrefix = messageContent;
    let command: string;
    let rest: string;

    if (this.config.hasPrefix()) {
      prefix = this.config.prefix;
      withoutPrefix = messageContent.replace(this.config.prefix, "");
    }

    [command, ...rest as any] = withoutPrefix.split(this.config.paramDelimiter);
    rest = (rest as any).join(this.config.paramDelimiter);

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

    for (const param of this.config.params) {
      content = this.removeLeadingDelimiter(content);
      const name = param.name;

      if (param.hungry) {
        const { parsed, remaining } = this.parseHungryParam(content, param);

        params[name] = parsed;
        content = remaining;
        continue;
      }

      try {
        let res: any;

        switch (param.type) {
          case CommandArgumentType.USER:
            content = this.parseRegexParm(
              USER_MENTION_REGEXP,
              content,
              param
            ) as string;
            params[name] = author;
            break;
          case CommandArgumentType.CHANNEL:
            content = this.parseRegexParm(
              CHANNEL_MENTION_REGEXP,
              content,
              param
            ) as string;
            params[name] = channel;
            break;
          case CommandArgumentType.ROLE:
            res = this.parseRegexParm(ROLE_MENTION_REGEXP, content, param);
            params[name] = await guild.roles.fetch(res.parsed);
            content = res.remaining;
            break;
          case CommandArgumentType.STRING:
            res = this.paraseStringParam(content, param);
            params[name] = res.parsed;
            content = res.remaining;
            break;
          case CommandArgumentType.NUMBER:
            res = this.parseNumberParam(content, param);
            params[name] = res.parsed;
            content = res.remaining;
            break;
          case CommandArgumentType.SENTENCE:
            res = this.parseSentence(content, param);
            params[name] = res.parsed;
            content = res.remaining;
            break;
          case CommandArgumentType.DATE:
            res = this.parseDateParam(content, param);
            params[name] = res.parsed;
            content = res.remaining;
            break;
          case CommandArgumentType.ANY:
            res = this.parseAnyParam(content, param);
            params[name] = res.parsed;
            content = res.remaining;
            break;
        }
      } catch {
        throw new BadArgumentException(param);
      }
    }

    return params;
  }

  private parseHungryParam(content: string, param: ICommandParam) {
    return {
      remaining: "",
      parsed: content,
    };
  }

  private parseSentence(content: string, param: ICommandParam) {
    const { encapsulator } = param;

    if (!content.startsWith(encapsulator)) {
      throw new BadArgumentException(param);
    }

    content = content.replace(encapsulator, "");
    const closingIndex = content.indexOf(encapsulator);

    if (closingIndex === -1) {
      throw new BadArgumentException(param);
    }

    const parsed = content.substring(0, closingIndex);
    content = content.substring(closingIndex + 1);

    return {
      remaining: content,
      parsed: parsed,
    };
  }

  private parseRegexParm(regex: RegExp, content: string, param: ICommandParam) {
    const [sus, ...rest] = content.split(this.config.paramDelimiter);
    const matchResult = sus.match(regex);

    if (matchResult === null) {
      throw new BadArgumentException(param);
    }

    if (param.type === CommandArgumentType.ROLE) {
      const [parsed] = sus.match(/(\d+)/);
      return { remaining: rest.join(this.config.paramDelimiter), parsed };
    }

    return rest.join(this.config.paramDelimiter);
  }

  private removeLeadingDelimiter(content: string) {
    while (content.startsWith(this.config.paramDelimiter)) {
      content = content.replace(this.config.paramDelimiter, "");
    }

    return content;
  }

  private paraseStringParam(content: string, param: ICommandParam) {
    const [s, ...rest] = content.split(this.config.paramDelimiter);

    if (isNil(s) || s === "") {
      throw new BadArgumentException(param);
    }

    return {
      remaining: rest.join(this.config.paramDelimiter),
      parsed: String(s),
    };
  }

  private parseNumberParam(content: string, param: ICommandParam) {
    const [n, ...rest] = content.split(this.config.paramDelimiter);
    const num = Number(n);

    if (num === NaN) {
      throw new BadArgumentException(param);
    }

    return {
      remaining: rest.join(this.config.paramDelimiter),
      parsed: num,
    };
  }

  private parseDateParam(content: string, param: ICommandParam) {
    const [d, ...rest] = content.split(this.config.paramDelimiter);

    const format = param.dateFormat;
    const date = dayjs(d, format);

    if (date.isValid() === false) {
      throw new BadArgumentException(param);
    }

    return {
      remaining: rest.join(this.config.paramDelimiter),
      parsed: date,
    };
  }

  private parseAnyParam(content: string, param: ICommandParam) {
    const [a, ...rest] = content.split(this.config.paramDelimiter);

    return {
      parsed: a,
      remaining: rest.join(this.config.paramDelimiter),
    };
  }
}
