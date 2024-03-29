import { AdapterRef } from '@core/adapters';
import { WatsonClientBase } from '@core/interfaces';
import { LifecycleHost } from '@core/lifecycle';
import { RouteExplorer } from '@core/router';
import { CanActivate, ExceptionHandler, MatchingStrategy, PipeTransform } from '@watsonjs/common';
import { ApplicationRef, Injector, Type } from '@watsonjs/di';
import { ActivityOptions } from 'discord.js';
import { config } from 'process';
import { PassThrough } from 'stream';

import { ApplicationConfig } from './application-config';
import { ApplicationProxy } from './application-proxy';
import { SHUTDOWN_SIGNALS } from './constants';
import { BootstrappingHandler } from './exceptions/revisit/bootstrapping-handler';

/**
 * Main Application class
 */
export class WatsonApplication<
  T extends WatsonClientBase
> extends ApplicationRef {
  private readonly _config!: ApplicationConfig;
  private readonly _routeExplorer: RouteExplorer;
  private readonly _applicationProxy: ApplicationProxy;
  private readonly _lifecycleHost: LifecycleHost;
  private readonly _adapter: AdapterRef<T["client"], T["options"]>;

  private _isStarted: boolean = false;
  private _isInitialized: boolean = false;

  constructor(rootInjector: Injector) {
    super(rootInjector);
    MatchingStrategy;
    this._routeExplorer = new RouteExplorer();
    this._applicationProxy = new ApplicationProxy();
    this._lifecycleHost = new LifecycleHost(rootInjector);
    this._adapter = (config as any).clientAdapter;
  }

  /**
   * Starts the Watson application.
   * Returns the client adapter instance.
   */
  public async start() {
    this.registerShutdownHook();

    !this._isInitialized && (await this._init());
    await this._adapter.start();
    this._isStarted = true;
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
      await (this._routeExplorer as any).explore(); //TODO:
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
    return " " as any;
  }

  /**
   * Sets a global prefix for all commands.
   * It it will only be applied if none is specified for either a router or a command.
   */
  public setGlobalPrefix(prefix: string) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalInterceptor(handler: ExceptionHandler) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalGuard(handler: CanActivate) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalFilter(handler: PassThrough) {}

  /**
   * Adds a global exceptions handler that will be added to every event handler.
   */
  public addGlobalPipe(handler: PipeTransform) {}

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
