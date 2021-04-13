import { DynamicModule, isNil } from '@watsonjs/common';
import {
  ApplicationConfig,
  BootstrappingHandler,
  InstanceLoader,
  IWatsonApplicationOptions,
  LifecycleHost,
  MetadataResolver,
  WatsonApplication,
  WatsonContainer,
} from '@watsonjs/core';

import { GuildTestingApplication } from './guild-testing-module';
import { TestEnvironment } from './test-environment';

export class TestingModuleBuilder {
  private readonly configuration = new ApplicationConfig();
  private readonly container = new WatsonContainer(this.configuration);
  private readonly resolver = new MetadataResolver(this.container);
  private readonly lifecycleHost = new LifecycleHost(this.container);
  private readonly instanceLoader = new InstanceLoader(this.container);

  private readonly rootModule: DynamicModule;

  private readonly testEnvironment: TestEnvironment;

  constructor(
    module: DynamicModule,
    environment: TestEnvironment,
    options?: IWatsonApplicationOptions
  ) {
    this.rootModule = module;
    this.testEnvironment = environment;
    this.configuration.assingOptions(options);
  }

  public compile() {
    return this.createApplicationInstance();
  }

  public async compileWithGuildIntegration() {
    if (isNil(this.configuration.authToken)) {
      throw new Error(
        "Testing with guild integration requires an authentication token"
      );
    }

    const application = await this.createApplicationInstance();
    return new GuildTestingApplication(
      this.testEnvironment,
      application,
      this.container
    );
  }

  private async createApplicationInstance() {
    await BootstrappingHandler.run(async () => {
      await this.resolver.createTestingModule(this.rootModule);
      await this.instanceLoader.createInstances();
      await this.lifecycleHost.callOnModuleInitHook();
    });

    return new WatsonApplication(this.configuration, this.container);
  }
}
