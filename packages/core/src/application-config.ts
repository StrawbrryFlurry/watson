import { CanActivate, EventExceptionHandler, IPrefix, PassThrough, PipeTransform } from '@watsonjs/common';
import { ClientOptions, Snowflake } from 'discord.js';

import { AbstractDiscordAdapter } from './adapters';
import { WatsonApplicationOptions } from './interfaces';

export class ApplicationConfig<DiscordClient = any> {
  public globalCommandPrefix: IPrefix;
  public clientOptions: ClientOptions;
  public discordAuthToken: string;
  public acknowledgementReaction: string | Snowflake;
  public clientAdapter: AbstractDiscordAdapter;
  public clientInstance: DiscordClient;
  public globalExceptionHandlers = new Set<EventExceptionHandler>();

  // TODO: Add global interceptors
  public globalGuards = new Set<CanActivate>();
  public globalPipes = new Set<PipeTransform>();
  public globalFilters = new Set<PassThrough>();

  public setClientAdapter(adapter: AbstractDiscordAdapter) {
    this.clientAdapter = adapter;
  }

  public setClientInstance(instance: DiscordClient) {
    this.clientInstance = instance;
  }

  public setAuthToken(authToken: string) {
    this.discordAuthToken = authToken;
  }

  public setClientOptions(options: ClientOptions) {
    this.clientOptions = options;
  }

  public setAcknowledgementReaction(reaction: string | Snowflake) {
    this.acknowledgementReaction = reaction;
  }

  public setGlobalPrefix(prefix: IPrefix) {
    this.globalCommandPrefix = prefix;
  }

  public addGlobalExceptionHandler(handler: EventExceptionHandler) {
    this.globalExceptionHandlers.add(handler);
  }

  public assignOptions(options: Partial<WatsonApplicationOptions> | undefined) {
    Object.assign(this, options);
  }

  public get authToken() {
    return this.discordAuthToken;
  }

  public get withAcknowledgementReaction(): boolean {
    return !!this.acknowledgementReaction;
  }
}
