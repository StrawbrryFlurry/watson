import { EventException, EventExceptionHandler, isNil } from '@watsonjs/common';
import { ClientOptions, Snowflake } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { IWatsonApplicationOptions } from './interfaces';

export class ApplicationConfig {
  public globalCommandPrefix: string;
  public clientOptions: ClientOptions;
  public authToken: string;
  public acknowledgementReaction: string | Snowflake;
  public clientAdapter: DiscordJSAdapter;
  public globalExceptionHandlers = new Set<EventExceptionHandler<any>>();

  constructor(options: IWatsonApplicationOptions, client: DiscordJSAdapter) {
    this.clientAdapter = client;

    if (isNil(options)) {
      return;
    }

    this.authToken = options.discordAuthToken;
    this.clientOptions = options.clientOptions;
    this.acknowledgementReaction = options.acknowledgeReaction;
  }

  public addGlobalExceptionHandler<T extends EventException[]>(
    handler: EventExceptionHandler<T>
  ) {
    this.globalExceptionHandlers.add(handler);
  }
}
