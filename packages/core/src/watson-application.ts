import { Type } from '@watson/common';

import { CommandExplorer } from './command/command-explorer';
import { WatsonContainer } from './watson-container';

/**
 * Main Application class that holds all other components
 */
export class WatsonApplication {
  private container: WatsonContainer;
  private commandExplorer: CommandExplorer;

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  public async start(): Promise<Boolean> {
    return true;
  }

  public async init() {}

  public getProviderInstance<T>(provider: Type<T>): T {
    return this.container.getInstanceOfProvider<T>(provider);
  }

  public addGlobalPrefix(prefix: string) {
    this.container.addGlobalPrefix(prefix);
  }
}
