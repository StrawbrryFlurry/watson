import { Type } from '@watson/common';
import { ActivityOptions, Client, Snowflake } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { ApplicationProxy } from './application-proxy';
import { Logger } from './logger';
import { RouteExplorer } from './routes';
import { WatsonContainer } from './watson-container';

/**
 * Main Application class that holds all other components
 */
export class WatsonApplication {
  private logger = new Logger("WatsonApplication");
  private container: WatsonContainer;
  private config: ApplicationConfig;
  private routeExplorer: RouteExplorer;
  private applicationProxy: ApplicationProxy;
  private clientAdapter: DiscordJSAdapter;

  private isStarted: boolean = false;
  private isInitialized: boolean = false;

  constructor(
    config: ApplicationConfig,
    container: WatsonContainer,
    client: DiscordJSAdapter
  ) {
    this.config = config;
    this.container = container;
    this.routeExplorer = new RouteExplorer(this.container);
    this.applicationProxy = new ApplicationProxy();
    this.clientAdapter = client;
  }

  public async start() {
    !this.isInitialized && (await this.init());
    await this.clientAdapter.start();
    this.isStarted = true;
    return this.clientAdapter;
  }

  public async stop() {
    await this.clientAdapter.stop();
  }

  private async init() {
    await this.routeExplorer.explore();
    await this.clientAdapter.initialize();
    this.applicationProxy.initFromRouteExplorer(this.routeExplorer);
    await this.applicationProxy.initAdapter(this.clientAdapter);
    this.isInitialized = true;
  }

  public getProviderInstance<T>(provider: Type<T>): T {
    return this.container.getInstanceOfProvider<T>(provider);
  }

  public addGlobalPrefix(prefix: string) {
    this.config.globalCommandPrefix = prefix;
  }

  /**
   * @param reaction A unicode Emote [✔] or Emote snowflake
   */
  public setAcknowledgeReaction(reaction: string | Snowflake) {
    this.config.acknowledgementReaction = reaction;
  }

  public setActivity(options: ActivityOptions) {
    this.clientAdapter.setActivity(options);
  }

  public setClient(client: Client) {
    this.clientAdapter.setClient(client);
  }

  public setAuthToken(token: string) {
    this.clientAdapter.setAuthToken(token);
    this.config.authToken = token;
  }
}
