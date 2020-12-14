import { Type } from "@watson/common";
import iterate from "iterare";
import { type } from "os";

import { DiscordJSAdapter } from "./adapters";
import { ApplicationConfig } from "./application-config";
import { UnknownModuleException, UnknownProviderException } from "./exceptions";
import { ModuleTokenFactory } from "./helpers/module-token-factory";
import { Injector, Module } from "./injector";

/**
 * Contains application state such as modules and provides an interface to get those
 */
export class WatsonContainer {
  private injector: Injector = new Injector();
  private readonly modules = new Map<string, Module>();
  private config: ApplicationConfig;
  private moduleTokenFactory = new ModuleTokenFactory();

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
      throw new UnknownModuleException();
    }

    const module = new Module(metatype, this);
    const moduleRef = this.modules.get(token);
    moduleRef.addImport(module);
  }

  public addExport(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }

    const moduleRef = this.modules.get(token);
    const exportedMoudleRef = this.moduleTokenFactory.getTokenByModuleType(
      metatype
    );

    if (exportedMoudleRef) {
    } else {
      moduleRef.addExportedProvider("s");
    }
  }

  public addReceiver(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
    }

    const moduleRef = this.getModuleByToken(token);
    moduleRef.addReceiver(metatype);
  }

  public addInjectable(token: string, metatype: Type) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException();
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
      throw new UnknownProviderException(metatype.name);
    }

    const providerRef = moduleProviders.get(metatype.name);
    return providerRef.instance as T;
  }
}
