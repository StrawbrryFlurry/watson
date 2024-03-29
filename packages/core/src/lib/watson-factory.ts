import { AdapterRef } from '@core/adapters';
import { CommandContainer } from '@core/command';
import { WatsonClientBase } from '@core/interfaces';
import { LifecycleHost } from '@core/lifecycle';
import { CREATE_APP_CONTEXT, Logger } from '@core/logger';
import { isNil } from '@watsonjs/common';
import {
  ClassProvider,
  Injector,
  InquirerContext,
  ModuleContainer,
  ModuleLoader,
  NewableTo,
  Type,
  ValueProvider,
} from '@watsonjs/di';

import { BootstrappingHandler } from './exceptions/revisit/bootstrapping-handler';
import { WatsonApplication } from './watson-application';

const DEFAULT_ADAPTER_PACKAGE = "@watsonjs/platform-discordjs";

export class WatsonFactory {
  private static logger = new Logger(new InquirerContext(WatsonFactory));

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

  public static async create<T extends WatsonClientBase>(
    module: Type,
    options?: WatsonClientBase,
    adapter?: NewableTo<AdapterRef>
  ): Promise<WatsonApplication<T>> {
    this.logger.logMessage(CREATE_APP_CONTEXT());
    const AdapterCtor = await this.getAdapterOrDefault(adapter);
    const adapterRef = new AdapterCtor(options);

    const rootInjector = Injector.create(
      this.makeApplicationProviders(adapterRef),
      Injector.NULL
    );

    await this.initialize(module, rootInjector);

    const applicationRef = new WatsonApplication<T>(rootInjector);
    return applicationRef;
  }

  private static makeApplicationProviders(
    adapter: AdapterRef
  ): (ValueProvider | ClassProvider)[] {
    return [
      {
        provide: AdapterRef,
        useValue: adapter,
      },
      {
        provide: CommandContainer,
        useValue: new CommandContainer(),
      },
      {
        provide: ModuleContainer,
        useValue: new ModuleContainer(),
      },
    ];
  }

  private static async initialize(module: Type, injector: Injector) {
    const loader = new ModuleLoader(injector);
    const lifecycleHost = new LifecycleHost(injector);

    await BootstrappingHandler.run(async () => {
      await loader.resolveRootModule(module);
      await lifecycleHost.callOnModuleInitHook();
    });
  }
}
