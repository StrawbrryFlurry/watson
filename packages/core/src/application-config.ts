import { ClientOptions, Snowflake } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { IWatsonApplicationOptions } from './interfaces';

export class ApplicationConfig {
  public globalCommandPrefix: string;
  public clientOptions: ClientOptions;
  public authToken: string;
  public acknowledgementReaction: string | Snowflake;
  public clientAdapter: DiscordJSAdapter;

  constructor(options: IWatsonApplicationOptions, client: DiscordJSAdapter) {
    this.clientAdapter = client;
    this.authToken = options.discordAuthToken;
    this.clientOptions = options.clientOptions;
    this.acknowledgementReaction = options.acknowledgeReaction;
  }
}
