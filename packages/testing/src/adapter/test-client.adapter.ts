import { isNil, IWSEvent, TestBootstrapException, WatsonEvent } from '@watsonjs/common';
import { AbstractDiscordAdapter, ApplicationConfig } from '@watsonjs/core';
import { Client, ClientOptions, Guild, Message, Snowflake, TextChannel } from 'discord.js';
import { Observable } from 'rxjs';

import { TestGuild } from '../discord';

export class TestClientAdapter extends AbstractDiscordAdapter<
  Client,
  ClientOptions
> {
  constructor(config: ApplicationConfig) {
    super(config);
  }

  public async initialize(): Promise<void> {
    await this.createClientInstance();
  }

  private async createClientInstance() {
    this.client = this.client || new Client(this.clientOptions || {});
  }

  public async fetchTestChannel(id: Snowflake): Promise<TextChannel> {
    const channelRef = await this.client.channels.fetch(id);

    if (isNil(channelRef) || !channelRef.isText()) {
      throw new TestBootstrapException(
        "The channel specified does not exist or is not a valid text channel"
      );
    }

    return channelRef as TextChannel;
  }

  public async fetchTestGuild(id: Snowflake): Promise<Guild> {
    const guildRef = await this.client.guilds.fetch(id);

    if (isNil(guildRef)) {
      throw new TestBootstrapException("The guild specified does not exist");
    }
    new Message(this.client, {}, new TextChannel(guildRef, {}));

    const testGuild = new TestGuild();

    return guildRef;
  }

  protected async login(): Promise<void> {
    await this.client.login(this.token);
  }

  /**
   *
   * @note
   *
   * Internal methods are not required as
   * the client only requires to execute messages
   * and not receive them.
   */
  protected initializeSlashCommands(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected parseEvent(event: WatsonEvent): string {
    throw new Error("Method not implemented.");
  }

  protected setUserActivity(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected destroy(): void {
    throw new Error("Method not implemented.");
  }

  public registerListener<T, E extends WatsonEvent>(
    event: E
  ): Observable<T | [T]> {
    throw new Error("Method not implemented.");
  }

  public registerWsListener<T extends {}, E extends WatsonEvent>(
    event: E
  ): Observable<IWSEvent<T>> {
    throw new Error("Method not implemented.");
  }
}
