import { ClientOptions } from 'discord.js';

import { IWatsonApplicationOptions } from './interfaces';

export class ApplicationConfig {
  globalCommandPrefix: string;

  clientOptions: ClientOptions;
  authToken: string;

  constructor(options: IWatsonApplicationOptions) {
    this.authToken = options.discordAuthToken;
    this.clientOptions = options.clientOptions;
  }
}
