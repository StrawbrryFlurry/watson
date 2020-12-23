import { Type } from '@watson/common';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { BootstrappingZone } from './exceptions';
import { MetadataResolver } from './injector';
import { InstanceLoader } from './injector/instance-loader';
import { IWatsonApplicationOptions } from './interfaces';
import { Logger } from './logger';
import { WatsonApplication } from './watson-application';
import { WatsonContainer } from './watson-container';

export class WatsonApplicationFactory {
  private static logger = new Logger("WatsonFactory");

  public static async create(module: Type, options: IWatsonApplicationOptions) {
    this.logger.log("Creating application context", "status");
    const appOptions = new ApplicationConfig(options);
    const container = new WatsonContainer(appOptions);
    const client = this.createClientInstance(container);
    container.applyClientAdapter(client);

    await this.initialize(module, container);

    return new WatsonApplication(container);
  }

  private static async initialize(module: Type, container: WatsonContainer) {
    const resolver = new MetadataResolver(container);
    const instanceLoader = new InstanceLoader(container);

    this.logger.log("Resolving Modules", "status");
    await BootstrappingZone.runAsync(() => {
      resolver.resolveRootModule(module);
      instanceLoader.createInstances();
    }).catch();
  }

  private static createClientInstance(container: WatsonContainer) {
    const token = container.getAuthToken();
    const options = container.getClientOptions();

    return new DiscordJSAdapter(token, options);
  }
}
