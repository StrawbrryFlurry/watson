import { ClientOptions } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { IWatsonApplicationOptions } from './interfaces';

export class ApplicationConfig {
  globalCommandPrefix: string;
  clientOptions: ClientOptions;
  authToken: string;

  clientAdapter: DiscordJSAdapter;

  constructor(options: IWatsonApplicationOptions, client: DiscordJSAdapter) {
    this.clientAdapter = client;
    this.authToken = options.discordAuthToken;
    this.clientOptions = options.clientOptions;
  }
}
