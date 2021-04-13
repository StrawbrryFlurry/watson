import { isNil, IWSEvent, WatsonEvent } from '@watsonjs/common';
import { Channel, Client, ClientEvents, ClientOptions, Guild } from 'discord.js';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApplicationConfig } from '../application-config';
import { BootstrappingException } from '../exceptions';
import { AbstractDiscordAdapter } from './abstract-discord-adapter';
import { parseToDiscordJsEvent } from './event-parser';

export const CLIENT_ADAPTER_SUGGESTIONS = [
  "Add the token as an option to the WatsonFactory",
  "Set the token to the WatsonApplication instance using the setToken method.",
];

export class DiscordJsAdapter extends AbstractDiscordAdapter<
  Client,
  ClientOptions
> {
  constructor(configuration: ApplicationConfig<Client>) {
    super(configuration);
  }

  public async initialize() {
    if (isNil(this.token)) {
      throw new BootstrappingException(
        "ClientAdapter",
        "No auth token was provided",
        CLIENT_ADAPTER_SUGGESTIONS
      );
    }

    await this.createClientInstance();
  }

  protected async initializeSlashCommands() {
    //const clientID = this.client.user.id;
    //
    //this.slashCommandAdapter = new SlashCommandAdapter({
    //  applicationId: clientID,
    //  authToken: this.token,
    //});
    //
    //const commands = await this.slashCommandAdapter.getApplicationCommands();
  }

  private async createClientInstance() {
    this.client = this.client || new Client(this.clientOptions || {});
  }

  public fetchChannel(id: string): Promise<Channel> {
    return this.client.channels.fetch(id);
  }

  public fetchGuild(id: string): Promise<Guild> {
    return this.client.guilds.fetch(id);
  }

  public registerListener<T, E extends WatsonEvent>(
    event: E
  ): Observable<T | [T]> {
    const eventName = this.parseEvent(event);
    return fromEvent<T>(this.client, eventName).pipe(
      map((value) => (Array.isArray(value) ? value : [value]))
    );
  }

  public registerWsListener<T extends {}, E extends WatsonEvent>(
    event: E
  ): Observable<IWSEvent<T>> {
    const eventName = this.parseEvent(event);
    return fromEvent<IWSEvent<T>>(this.client.ws, eventName);
  }

  protected parseEvent(event: WatsonEvent): keyof ClientEvents | "raw" {
    return parseToDiscordJsEvent(event);
  }

  protected async setUserActivity(): Promise<void> {
    if (this.ready.value !== true) {
      return;
    }

    if (typeof this.activity !== "undefined") {
      await this.client.user.setActivity(this.activity);
    } else {
      await this.client.user.setActivity();
    }
  }

  protected async login(): Promise<void> {
    await this.client.login(this.token);
  }

  protected destroy(): void {
    this.client.destroy();
  }
}
