import { WatsonContainer } from './watson-container';

/**
 * Main Application class that holds all other components
 */
export class WatsonApplication {
  private container: WatsonContainer;

  constructor(container: WatsonContainer) {}

  public async start(): Promise<Boolean> {
    return true;
  }
}
