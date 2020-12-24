import { Type } from '@watson/common';
import { ActivityOptions, Client, Snowflake } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
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
    this.commandExplorer.explore();
    await this.clientAdapter.start();

    return this.clientAdapter;
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
}
