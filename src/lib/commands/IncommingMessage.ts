import { Message } from 'discord.js';

import { ICommandHandle } from './interfaces';

export class IncommingMessage {
  public message: Message;
  public channelID: string;
  public content: string;
  public command?: ICommandHandle;
  public arguments?: string[];
  public baseMessage: string;

  constructor(message: Message) {
    this.message = message;
    this.channelID = message.channel.id;
    this.content = message.content;
  }

  includesPrefix(prefixes: string[]) {
    const prefix = prefixes.find((prefix) => this.content.startsWith(prefix));
    return prefix;
  }

  getRemainingMessage(prefix: string, commandName: string) {
    this.baseMessage = this.content
      .replace(prefix, "")
      .replace(commandName, "");

    return this.baseMessage;
  }

  getCommandName(prefix: string, delimiter: string) {
    return this.content.replace(prefix, "").split(delimiter)[0];
  }

  getChannel() {
    return this.message.guild?.channels.cache.find(
      (channel) => channel.id === this.channelID
    );
  }
}
