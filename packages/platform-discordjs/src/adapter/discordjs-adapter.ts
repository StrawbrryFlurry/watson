import { IWSEvent, WatsonEvent } from '@watsonjs/common';
import { AdapterRef, ApplicationConfig, WatsonClientBase } from '@watsonjs/core';
import { Client, ClientOptions } from 'discord.js';
import { Observable } from 'rxjs';

export interface WatsonDiscordJSAdapter extends WatsonClientBase {
  client: Client;
  options: ClientOptions;
}

export class DiscordJsAdapter extends AdapterRef {
  public initialize(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected initializeSlashCommands(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected parseEvent(event: WatsonEvent): string {
    throw new Error("Method not implemented.");
  }
  protected setUserActivity(): Promise<void> {
    if (this.ready.value !== true) {
      return;
    }

    if (typeof this.activity !== "undefined") {
      await this.client.user.setActivity(this.activity);
    } else {
      await this.client.user.setActivity();
    }
  }
  protected login(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  protected destroy(): void {
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }

  constructor(config: ApplicationConfig<DiscordJsAdapter, ClientOptions>) {
    super(config);
  }
}
