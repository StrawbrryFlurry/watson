import { Type } from '@watson/common';
import { ActivityOptions, Client, Snowflake } from 'discord.js';
import { Subscription } from 'rxjs';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { CommandContainer } from './command';
import { CommandExplorer } from './command/command-explorer';
import { Logger } from './logger';
import { WatsonContainer } from './watson-container';

/**
 * Main Application class that holds all other components
 */
export class WatsonApplication {
  private logger = new Logger("WatsonApplication");
  private container: WatsonContainer;
  private config: ApplicationConfig;
  private commandExplorer: CommandExplorer;
  private clientAdapter: DiscordJSAdapter;
  private commandProxySub: Subscription;
  private commandContainer = new CommandContainer();

  private isStarted: boolean = false;
  private isInitialized: boolean = false;

  constructor(
    config: ApplicationConfig,
    container: WatsonContainer,
    client: DiscordJSAdapter
  ) {
    this.config = config;
    this.container = container;
    this.commandExplorer = new CommandExplorer(this.container);
    this.clientAdapter = client;
  }

  public async start() {
    !this.isInitialized && (await this.init());
    await this.clientAdapter.start();
    this.isStarted = true;
    return this.clientAdapter;
  }

  public async stop() {
    this.commandProxySub.unsubscribe();
    await this.clientAdapter.stop();
  }

  private async init() {
    this.commandExplorer.explore();
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
  public setAcknowledgeReaction(reaction: string | Snowflake) {}

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

  private registerCommandProxy() {
    this.commandProxySub = this.clientAdapter.registerEventProxy(
      this.commandProxy
    );
  }
}
