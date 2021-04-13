import { DiscordJsAdapter } from '@watsonjs/core';
import { Message, TextChannel } from 'discord.js';

export class TestMessage {
  private message: Message;
  private channel: TextChannel;
  private adapter: DiscordJsAdapter;

  constructor(
    message: Message,
    channel: TextChannel,
    adapter: DiscordJsAdapter
  ) {
    this.message = message;
    this.channel = channel;
    this.adapter = adapter;
  }

  public expectBotResponseToContain() {}
  public expectBotResponseToEqual() {}
  public expectBotResponseToBeOfType() {}

  public expectMessageToBeRemoved() {}
}
