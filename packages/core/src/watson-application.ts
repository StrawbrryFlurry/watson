import { EventExceptionHandler, ICommandPrefix, isString, RuntimeException, Type } from '@watsonjs/common';
import { ActivityOptions, Client, Snowflake } from 'discord.js';

import { AbstractDiscordAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { ApplicationProxy } from './application-proxy';
import { SHUTDOWN_SIGNALS } from './constants';
import { BootstrappingHandler } from './exceptions/revisit/bootstrapping-handler';
import { LifecycleHost } from './lifecycle/hooks';
import { APP_STARTING, APP_STRATED, Logger } from './logger';
import { RouteExplorer } from './router';
import { CommandPrefixHost } from './router/command/command-prefix-host';
import { WatsonContainer } from './watson-container';

/**
 * Main Application class
 */
export class WatsonApplication {
  private logger = new Logger("WatsonApplication");
  private container: WatsonContainer;
  private config: ApplicationConfig;
  private routeExplorer: RouteExplorer;
  private applicationProxy: ApplicationProxy;
  private clientAdapter: AbstractDiscordAdapter;
  private lifecycleHost: LifecycleHost;

  private isStarted: boolean = false;
  private isInitialized: boolean = false;
  private isDisposed = false;

  constructor(config: ApplicationConfig, container: WatsonContainer) {
    this.config = config;
    this.container = container;
    this.routeExplorer = new RouteExplorer(this.container);
    this.applicationProxy = new ApplicationProxy();
    this.lifecycleHost = new LifecycleHost(container);
    this.clientAdapter = config.clientAdapter;
  }

  /**
   * Starts the Watson application.
   * Returns the client adapter instance.
   */
  public async start() {
    if (this.isDisposed) {
      throw new RuntimeException(
        "Cannot start an application instance that is disposed"
      );
    }
    this.registerShutdownHook();
    this.logger.logMessage(APP_STARTING());

    !this.isInitialized && (await this.init());
    await this.clientAdapter.start();
    this.isStarted = true;
    this.logger.logMessage(APP_STRATED());
    return this.clientAdapter;
  }

  /**
   * Stops the application class and removes
   * all listeners from the client.
   */
  public async stop() {
    await this.clientAdapter.stop();
    this.isDisposed = true;
  }

  private async init() {
    await BootstrappingHandler.run(async () => {
      await this.lifecycleHost.callOnApplicationBootstrapHook();
      await this.routeExplorer.explore();
      await this.clientAdapter.initialize();
      this.applicationProxy.initFromRouteExplorer(this.routeExplorer);
      await this.applicationProxy.initAdapter(this.clientAdapter);
      this.isInitialized = true;
    });
  }

  /**
   * Returns a provider instance
   * @param token The injection token for the provider
   * Refer to the docs for more information about providers:
   * https://watsonjs.io/pages/providers
   */
  public getProviderInstance<T>(token: Type<T> | string): T {
    return this.container.getInstanceOfProvider<T>(token);
  }

  /**
   * Sets a global prefix for all commands.
   * It it will only be applied if none is specified for either a receiver or a command.
   */
  public addGlobalPrefix(prefix: ICommandPrefix | string) {
    const prefixHost = isString(prefix)
      ? new CommandPrefixHost(prefix)
      : prefix;

    this.config.globalCommandPrefix = prefixHost;
  }

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalExceptionsHandler(handler: EventExceptionHandler) {
    this.config.addGlobalExceptionHandler(handler);
  }

  /**
   * Reacts with this emote to any command message that is valid
   * @param reaction A unicode Emote [✔] or Emote snowflake
   */
  public setAcknowledgeReaction(reaction: string | Snowflake) {
    this.config.acknowledgementReaction = reaction;
  }

  /**
   * Sets the user activity of the bot
   * @param options `ActivityOptions` for the djs client.
   */
  public setActivity(options: ActivityOptions) {
    this.clientAdapter.setActivity(options);
  }

  /**
   * Sets an existing client for the discord adapter
   * @param client An existing djs client instance
   */
  public setClient(client: Client) {
    this.clientAdapter.setClient(client);
  }

  /**
   * Set the auth token for the discord application
   * @param token The bot token string.
   */
  public setAuthToken(token: string) {
    this.config.setAuthToken(token);
  }

  private registerShutdownHook() {
    const teardown = async () => {
      await this.lifecycleHost.callOnApplicationShutdownHook();

      if (this.isInitialized) {
        await this.stop();
      }

      process.exit(0);
    };

    for (const signal of SHUTDOWN_SIGNALS) {
      process.on(signal, teardown);
    }
  }
}
