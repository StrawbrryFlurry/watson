import { InstanceLoader, NewableTo } from '@di';
import { isNil, Type } from '@watsonjs/common';

import { AdapterRef, ApplicationConfig } from '.';
import { ModuleLoader } from './di/module-loader';
import { BootstrappingHandler } from './exceptions/revisit/bootstrapping-handler';
import { WatsonApplicationOptions } from './interfaces';
import { LifecycleHost } from './lifecycle/hooks';
import { CREATE_APP_CONTEXT, Logger } from './logger';
import { WatsonApplication } from './watson-application';
import { WatsonContainer } from './watson-container';

const DEFAULT_ADAPTER_PACKAGE = "@watsonjs/platform-discordjs";

export class WatsonFactory {
  private static logger = new Logger("WatsonFactory");

  private static async getAdapterOrDefault(
    adapter: NewableTo<AdapterRef> | undefined
  ): Promise<NewableTo<AdapterRef>> {
    if (!isNil(adapter)) {
      return adapter as NewableTo<AdapterRef>;
    }

    try {
      const { DiscordJsAdapter } = await import(DEFAULT_ADAPTER_PACKAGE);

      return DiscordJsAdapter as NewableTo<AdapterRef>;
    } catch (err: unknown) {
      this.logger.logException(
        "Could not import the default discord adapter from '@watsonjs/platform-discordjs'. Make sure that either this package is installed or provide a different adapter implementation.",
        err
      );
      throw err;
    }
  }

  public static async create<T extends WatsonApplication = WatsonApplication>(
    module: Type,
    options?: WatsonApplicationOptions,
    adapter?: NewableTo<AdapterRef>
  ): Promise<T> {
    this.logger.logMessage(CREATE_APP_CONTEXT());
    const config = new ApplicationConfig();
    const AdapterCtor = await this.getAdapterOrDefault(adapter);
    const adapterRef = new AdapterCtor(config);
    config.clientAdapter = adapterRef;
    config.assignOptions(options);
    const container = new WatsonContainer(config);

    await this.initialize(module, container);

    return new WatsonApplication(config, container) as T;
  }

  private static async initialize(module: Type, container: WatsonContainer) {
    const loader = new ModuleLoader();
    const instanceLoader = new InstanceLoader(container);
    const lifecycleHost = new LifecycleHost(container);

    await BootstrappingHandler.run(async () => {
      await loader.resolveRootModule(module);
      await instanceLoader.createInstances();
      await lifecycleHost.callOnModuleInitHook();
    });
  }
}
