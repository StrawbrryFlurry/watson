import { Injector } from '@di';
import { CanActivate, InjectorElementId, PipeTransform, Type, WATSON_ELEMENT_ID } from '@watsonjs/common';
import { ActivityOptions } from 'discord.js';
import { PassThrough } from 'stream';

import { AdapterRef, ExceptionHandler } from '.';
import { ApplicationConfig } from './application-config';
import { ApplicationProxy } from './application-proxy';
import { SHUTDOWN_SIGNALS } from './constants';
import { BootstrappingHandler } from './exceptions/revisit/bootstrapping-handler';
import { LifecycleHost } from './lifecycle/hooks';
import { APP_STARTED, APP_STARTING, Logger } from './logger';
import { RouteExplorer } from './router';
import { WatsonContainer } from './watson-container';

export abstract class ApplicationRef {
  public get rootInjector(): Injector {
    return this._rootInjector;
  }

  protected _rootInjector: Injector;

  constructor(rootInjector: Injector) {
    this._rootInjector = rootInjector;
  }

  static [WATSON_ELEMENT_ID] = InjectorElementId.Root;
}

/**
 * Main Application class
 */
export class WatsonApplication extends ApplicationRef {
  private readonly _logger = new Logger("WatsonApplication");
  private readonly _container: WatsonContainer;
  private readonly _config: ApplicationConfig;
  private readonly _routeExplorer: RouteExplorer;
  private readonly _applicationProxy: ApplicationProxy;
  private readonly _lifecycleHost: LifecycleHost;
  private readonly _adapter: AdapterRef;

  private _isStarted: boolean = false;
  private _isInitialized: boolean = false;

  constructor(rootInjector: Injector) {
    super(rootInjector);

    this._config = config;
    this._container = container;
    this._routeExplorer = new RouteExplorer(container);
    this._applicationProxy = new ApplicationProxy();
    this._lifecycleHost = new LifecycleHost(container);
    this._adapter = config.clientAdapter;
  }

  /**
   * Starts the Watson application.
   * Returns the client adapter instance.
   */
  public async start() {
    this.registerShutdownHook();
    this._logger.logMessage(APP_STARTING());

    !this._isInitialized && (await this._init());
    await this._adapter.start();
    this._isStarted = true;
    this._logger.logMessage(APP_STARTED());
    return this._adapter;
  }

  /**
   * Stops the application class and removes
   * all listeners from the client.
   */
  public async stop() {
    await this._adapter.stop();
  }

  private async _init() {
    await BootstrappingHandler.run(async () => {
      await this._lifecycleHost.callOnApplicationBootstrapHook();
      await this._routeExplorer.explore();
      await this._adapter.initialize();
      this._applicationProxy.initFromRouteExplorer(this._routeExplorer);
      await this._applicationProxy.initAdapter(this._adapter);
      this._isInitialized = true;
    });
  }

  /**
   * Returns a provider instance
   * @param token The injection token for the provider
   * Refer to the docs for more information about providers:
   * https://watsonjs.io/pages/providers
   */
  public getProviderInstance<T>(token: Type<T> | string): T {
    return this._container.getInstanceOfProvider<T>(token);
  }

  /**
   * Sets a global prefix for all commands.
   * It it will only be applied if none is specified for either a receiver or a command.
   */
  public setGlobalPrefix(prefix: string) {
    this._config.globalCommandPrefix = prefix;
  }

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalInterceptor(handler: ExceptionHandler) {
    this._config.globalExceptionHandlers.add(handler);
  }

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalGuard(handler: CanActivate) {
    this._config.globalExceptionHandlers.add(handler);
  }

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalFilter(handler: PassThrough) {
    this._config.globalExceptionHandlers.add(handler);
  }

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalPipe(handler: PipeTransform) {
    this._config.globalExceptionHandlers.add(handler);
  }

  /**
   * Creates a new instance of `handler` and
   * adds it as a global exception handler
   */
  public async addGlobalExceptionHandlerAsync(
    handler: Type<ExceptionHandler>
  ) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public async addGlobalInterceptorAsync(handler: Type<ExceptionHandler>) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public async addGlobalGuardAsync(handler: Type<CanActivate>) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public async addGlobalFilterAsync(handler: Type<PassThrough>) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public async addGlobalPipeAsync(handler: Type<PipeTransform>) {}

  /**
   * Sets the user activity of the bot
   * @param options `ActivityOptions` for the djs client.
   */
  public setActivity(options: ActivityOptions) {
    this._adapter.setActivity(options);
  }

  /**
   * Set the auth token for the discord application
   * @param token The bot token string.
   */
  public setAuthToken(token: string) {
    this._config.discordToken = token;
  }

  private registerShutdownHook() {
    const teardown = async () => {
      await this._lifecycleHost.callOnApplicationShutdownHook();

      if (this._isInitialized) {
        await this.stop();
      }

      process.exit(0);
    };

    for (const signal of SHUTDOWN_SIGNALS) {
      process.on(signal, teardown);
    }
  }
}
