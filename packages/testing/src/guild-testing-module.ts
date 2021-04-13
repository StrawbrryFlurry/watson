import { ApplicationConfig, DiscordJsAdapter, WatsonApplication, WatsonContainer } from '@watsonjs/core';
import { Client, Guild, TextChannel } from 'discord.js';

import { TestClientAdapter } from './adapter';
import { TestChannel, TestGuild } from './discord';
import { TestEnvironment } from './test-environment';

export interface ITestGuildOptions {
  testGuild: string;
  testChannelId: string;
}

/**
 * TODO:
 * Make testing module compatible with non DJS
 * clients
 */
export class GuildTestingApplication {
  private guildRef: Guild;
  private channelRef: TextChannel;

  private testChannel: TestChannel;
  private testGuild: TestGuild;

  private readonly container: WatsonContainer;
  private readonly instance: WatsonApplication;
  private readonly environment: TestEnvironment;

  /**
   * The instance that is being used to act
   * as the user for executing commands and
   * events
   */
  private clientInstance: TestClientAdapter;

  constructor(
    environment: TestEnvironment,
    instance: WatsonApplication,
    container: WatsonContainer
  ) {
    this.environment = environment;
    this.container = container;
    this.instance = instance;
  }

  public async init() {
    const { testGuild, testChannel } = this.environment;

    const clientConfig = this.getClientApplicationConfig();
    this.clientInstance = new TestClientAdapter(clientConfig);
    await this.clientInstance.initialize();
    await this.clientInstance.start();
    //this.testGuild = await this.clientInstance.fetchTestGuild(testGuild);
    //const testChannelRef = await this.clientInstance.fetchTestChannel(
    //  testChannel
    //);
  }

  public getTestGuild(): TestGuild {
    return this.testGuild;
  }

  public getTestChannel(): TestChannel {
    return this.testChannel;
  }

  public get adapter(): DiscordJsAdapter {
    return this.applicationConfig.clientAdapter as DiscordJsAdapter;
  }

  public get applicationConfig(): ApplicationConfig {
    return this.container.config;
  }

  public getClientApplicationConfig(): ApplicationConfig<Client> {
    const clientApplicationConfig = new ApplicationConfig<Client>();
    clientApplicationConfig.setAuthToken(this.environment.clientAuthToken);
    return clientApplicationConfig;
  }
}
