import { DiscordJsAdapter } from '@watsonjs/core';
import { TextChannel } from 'discord.js';

import { TestMessage } from './test-message';

export class TestChannel {
  private _channel: TextChannel;
  private adapter: DiscordJsAdapter;

  constructor(channel: TextChannel, adapter: DiscordJsAdapter) {
    this._channel = channel;
    this.adapter = adapter;
  }

  public async sendMessage(message: string) {
    const messageRef = await this._channel.send(message);
    return new TestMessage(messageRef, this._channel, this.adapter);
  }

  public get channel() {
    return this.channel;
  }
}
