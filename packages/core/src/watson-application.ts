import { Type } from '@watson/common';
import { Snowflake } from 'discord.js';

import { CommandExplorer } from './command/command-explorer';
import { Logger } from './logger';
import { WatsonContainer } from './watson-container';

/**
 * Main Application class that holds all other components
 */
export class WatsonApplication {
  private logger = new Logger("WatsonApplication");
  private container: WatsonContainer;
  private commandExplorer: CommandExplorer;

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  public async start(): Promise<Boolean> {
    this.commandExplorer = new CommandExplorer(this.container);

    this.commandExplorer.explore();

    return true;
  }

  public async init() {}

  public getProviderInstance<T>(provider: Type<T>): T {
    return this.container.getInstanceOfProvider<T>(provider);
  }

  public addGlobalPrefix(prefix: string) {
    this.container.addGlobalPrefix(prefix);
  }

  /**
   * @param reaction A unicode Emote [✔] or Emote snowflake
   */
  public setAcknowledgeReaction(reaction: string | Snowflake) {}
  public setActivity(activity: string) {}
  public setAuthToken(token: string) {}
}
