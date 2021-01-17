import { Type } from '@watsonjs/common';
import { Client } from 'discord.js';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { BootstrappingZone } from './exceptions';
import { MetadataResolver } from './injector';
import { InstanceLoader } from './injector/instance-loader';
import { IWatsonApplicationOptions } from './interfaces';
import { CREATE_APP_CONTEXT, Logger } from './logger';
import { WatsonApplication } from './watson-application';
import { WatsonContainer } from './watson-container';

export class WatsonFactory {
  private static logger = new Logger("WatsonFactory");

  public static async create(module: Type, options: IWatsonApplicationOptions) {
    this.logger.logMessage(CREATE_APP_CONTEXT());

    const client = this.createClientInstance(options);
    const appOptions = new ApplicationConfig(options, client);
    const container = new WatsonContainer(appOptions);

    await this.initialize(module, container);

    return new WatsonApplication(appOptions, container, client);
  }

  private static async initialize(module: Type, container: WatsonContainer) {
    const resolver = new MetadataResolver(container);
    const instanceLoader = new InstanceLoader(container);

    await BootstrappingZone.runAsync(async () => {
      await resolver.resolveRootModule(module);
      await instanceLoader.createInstances();
    }).catch();
  }

  private static createClientInstance(options: IWatsonApplicationOptions) {
    return options.client instanceof Client
      ? new DiscordJSAdapter(options.client)
      : new DiscordJSAdapter(options.discordAuthToken, options.clientOptions);
  }
}
