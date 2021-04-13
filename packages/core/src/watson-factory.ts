import { Type } from '@watsonjs/common';

import { DiscordJsAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { BootstrappingHandler } from './exceptions/bootstrapping-handler';
import { MetadataResolver } from './injector';
import { InstanceLoader } from './injector/instance-loader';
import { IWatsonApplicationOptions } from './interfaces';
import { LifecycleHost } from './lifecycle/hooks';
import { CREATE_APP_CONTEXT, Logger } from './logger';
import { WatsonApplication } from './watson-application';
import { WatsonContainer } from './watson-container';

export class WatsonFactory {
  private static logger = new Logger("WatsonFactory");

  public static async create(
    module: Type,
    options?: IWatsonApplicationOptions
  ) {
    this.logger.logMessage(CREATE_APP_CONTEXT());
    const appConfig = new ApplicationConfig();
    const client = new DiscordJsAdapter(appConfig);
    appConfig.setClientAdapter(client);
    appConfig.assingOptions(options);
    const container = new WatsonContainer(appConfig);

    await this.initialize(module, container);

    return new WatsonApplication(appConfig, container);
  }

  private static async initialize(module: Type, container: WatsonContainer) {
    const resolver = new MetadataResolver(container);
    const instanceLoader = new InstanceLoader(container);
    const lifecycleHost = new LifecycleHost(container);

    await BootstrappingHandler.run(async () => {
      await resolver.resolveRootModule(module);
      await instanceLoader.createInstances();
      await lifecycleHost.callOnModuleInitHook();
    });
  }
}
