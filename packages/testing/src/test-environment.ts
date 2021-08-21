import { DynamicModule, IModuleOptions } from '@watsonjs/common';
import { IWatsonApplicationOptions } from '@watsonjs/core';

import { TestingModuleBuilder } from './testing-module-builder';
import { TestingModule } from './testing.module';

export interface TestEnvironmentOptions {
  /**
   * The auth token used for the bot.
   */
  applicationAuthToken: string;
  /**
   * The auth token used for the client
   * which will interact with the bot for
   * testing.
   */
  clientAuthToken?: string;
  /**
   * The guild in which tests will be run.
   */
  testGuildId?: string;
  /**
   * The channel in which tests will be run.
   */
  testChannelId?: string;
}

export class TestEnvironment {
  private readonly environment: TestEnvironmentOptions;

  constructor(environment: TestEnvironmentOptions) {
    this.environment = environment;
  }

  public createTestingModule(
    moduleOptions: IModuleOptions,
    applicationOptions?: IWatsonApplicationOptions
  ) {
    const module: DynamicModule = {
      module: TestingModule,
      ...moduleOptions,
    };

    return new TestingModuleBuilder(module, this, applicationOptions);
  }

  public get applicationAuthToken(): string {
    return this.environment.applicationAuthToken;
  }
  public get clientAuthToken(): string {
    return this.environment.clientAuthToken;
  }

  public get testGuild(): string {
    return this.environment.testGuildId;
  }

  public get testChannel(): string {
    return this.environment.testChannelId;
  }
}
