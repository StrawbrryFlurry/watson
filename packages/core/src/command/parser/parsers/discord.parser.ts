import { BadArgumentException, getId, IGetIdTypes } from '@watsonjs/common';
import { Channel, GuildMember, Message, Role } from 'discord.js';

import { CommandArgumentWrapper } from '../../command-argument-wrapper';

export class DiscordMessageTypeParser {
  public parseChannel(
    message: Message,
    content: string,
    argument: CommandArgumentWrapper
  ) {
    return this.parse<Channel>(
      message,
      content,
      "channel",
      "channels",
      argument
    );
  }

  public parseUser(
    message: Message,
    content: string,
    argument: CommandArgumentWrapper
  ) {
    return this.parse<GuildMember>(
      message,
      content,
      "user",
      "members",
      argument
    );
  }

  public parseRole(
    message: Message,
    content: string,
    argument: CommandArgumentWrapper
  ) {
    return this.parse<Role>(message, content, "role", "roles", argument);
  }

  private parse<T = any>(
    message: Message,
    content: string,
    idKey: IGetIdTypes,
    guildKey: string,
    argument: CommandArgumentWrapper
  ): T {
    let id: string;

    try {
      id = getId(idKey, content);
    } catch {
      throw new BadArgumentException(argument);
    }

    const { guild } = message;
    return guild[guildKey].cache.find((e: { id: string }) => e.id === id);
  }
}
