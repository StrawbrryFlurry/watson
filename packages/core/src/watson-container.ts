import { Type } from '@watson/common';
import iterate from 'iterare';

import { DiscordJSAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { UnknownModuleException, UnknownProviderException } from './exceptions';
import { ModuleTokenFactory } from './helpers/module-token-factory';
import { Module } from './injector';
import { GlobalInstanceHost } from './injector/global-instance-host';

/**
 * Contains application state such as modules and provides an interface to get those
 */
export class WatsonContainer {
  private readonly modules = new Map<string, Module>();
  public config: ApplicationConfig;
  private moduleTokenFactory = new ModuleTokenFactory();
  public globalInstanceHost = new GlobalInstanceHost(this);

  private clientAdapter: DiscordJSAdapter;

  constructor(config: ApplicationConfig) {
    this.config = config;
  }

  public applyClientAdapter(client: DiscordJSAdapter) {
    this.clientAdapter = client;
  }

  public getClient() {
    return this.clientAdapter;
  }

  public getAuthToken() {
    return this.config.authToken;
  }

  public getClientOptions() {
    return this.config.clientOptions;
  }

  public getModules() {
    return this.modules;
  }

  public addModule(metatype: Type) {
    const token = this.moduleTokenFactory.generateModuleToken(metatype);
    const module = new Module(metatype, this);

    this.modules.set(token, module);

    return token;
  }

  public addImport(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const importedModuleToken = this.moduleTokenFactory.getTokenByModuleType(
      metatype
    );
    const importedModuleRef = this.modules.get(importedModuleToken);
    const moduleRef = this.modules.get(token);

    moduleRef.addImport(importedModuleRef);
  }

  public addExport(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.modules.get(token);
    const exportedModuleToken = this.moduleTokenFactory.getTokenByModuleType(
      metatype
    );

    if (exportedModuleToken) {
      const exportedModuleRef = this.modules.get(exportedModuleToken);
      moduleRef.addExportedModule(exportedModuleRef);
    } else {
      moduleRef.addExportedProvider(metatype);
    }
  }

  public addReceiver(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.getModuleByToken(token);
    moduleRef.addReceiver(metatype);
  }

  public addInjectable(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.getModuleByToken(token);
    moduleRef.addInjectable(metatype);
  }

  public getModuleByToken(token: string): Module {
    if (this.modules.has(token)) {
      return this.modules.get(token);
    }

    return undefined;
  }

  public hasModule(metatype: Type) {
    return !!this.moduleTokenFactory.getTokenByModuleType(metatype);
  }

  public getInstanceOfProvider<T>(metatype: Type<T>): T {
    const providers = iterate(this.modules.entries())
      .map(([token, moduleRef]) => moduleRef.providers)
      .toArray();

    const moduleProviders = providers.find((provider) =>
      provider.has(metatype.name)
    );

    if (typeof moduleProviders === "undefined") {
      throw new UnknownProviderException("WatsonContainer", metatype.name);
    }

    const providerRef = moduleProviders.get(metatype.name);
    return providerRef.instance as T;
  }

  public addGlobalPrefix(prefix: string) {
    this.config.globalCommandPrefix = prefix;
  }
}
