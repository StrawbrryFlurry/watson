import { BadArgumentException, getId, ICommandParam, IGetIdTypes } from '@watsonjs/common';
import { Channel, GuildMember, Message, Role } from 'discord.js';

export class DiscordMessageTypeParser {
  public parseChannel(message: Message, content: string, param: ICommandParam) {
    return this.parse<Channel>(message, content, "channel", "channels", param);
  }

  public parseUser(message: Message, content: string, param: ICommandParam) {
    return this.parse<GuildMember>(message, content, "user", "members", param);
  }

  public parseRole(message: Message, content: string, param: ICommandParam) {
    return this.parse<Role>(message, content, "role", "roles", param);
  }

  private parse<T = any>(
    message: Message,
    content: string,
    idKey: IGetIdTypes,
    guildKey: string,
    param: ICommandParam
  ): T {
    let id: string;

    try {
      id = getId(idKey, content);
    } catch {
      throw new BadArgumentException(param);
    }

    const { guild } = message;
    return guild[guildKey].cache.find((e: { id: string }) => e.id === id);
  }
}
