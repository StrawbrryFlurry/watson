import { BadArgumentException, getId, ICommandParam, IGetIdTypes } from '@watsonjs/common';
import { Message } from 'discord.js';

export class DiscordMessageTypeParser {
  public parseChannel(message: Message, content: string, param: ICommandParam) {
    return this.parse(message, content, "channel", "channels", param);
  }

  public parseUser(message: Message, content: string, param: ICommandParam) {
    return this.parse(message, content, "user", "members", param);
  }

  public parseRole(message: Message, content: string, param: ICommandParam) {
    return this.parse(message, content, "role", "roles", param);
  }

  private parse(
    message: Message,
    content: string,
    idKey: IGetIdTypes,
    guildKey: string,
    param: ICommandParam
  ) {
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
