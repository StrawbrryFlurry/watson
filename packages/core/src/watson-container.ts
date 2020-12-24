import { Type } from '@watson/common';

import { ApplicationConfig } from './application-config';
import { UnknownModuleException } from './exceptions';
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

  constructor(config: ApplicationConfig) {
    this.config = config;
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
    const data = this.globalInstanceHost.getInstance(metatype.name, "provider");

    return data.wrapper.instance as T;
  }
}
