import { CustomProvider, DynamicModule, MODULE_GLOBAL_METADATA, Type } from '@watsonjs/common';
import iterate from 'iterare';

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
  private readonly globalModules = new Set<Module>();
  private dynamicModuleMetadata = new Map<string, Partial<DynamicModule>>();

  constructor(config: ApplicationConfig) {
    this.config = config;
  }

  public getModules() {
    return this.modules;
  }

  public addModule(metatype: Type | DynamicModule) {
    const token = this.moduleTokenFactory.generateModuleToken(metatype);
    let module: Module;

    if (this.isDynamicModule(metatype)) {
      module = this.addDynamicModule(token, metatype as DynamicModule);
    } else {
      module = new Module(metatype as Type, this);
      this.modules.set(token, module);
    }

    if (this.isGlobalModule(metatype)) {
      this.globalModules.add(module);
    }

    return token;
  }

  public isGlobalModule(module: Type | DynamicModule) {
    if (this.isDynamicModule(module) && (module as DynamicModule).global) {
      return true;
    }

    return Reflect.getMetadata(MODULE_GLOBAL_METADATA, module);
  }

  public addDynamicModule(token: string, module: DynamicModule) {
    const { module: metatype, exports, imports, receivers, providers } = module;

    this.dynamicModuleMetadata.set(token, {
      exports,
      imports,
      receivers,
      providers,
    });

    const moduleRef = new Module(metatype, this);
    this.modules.set(token, moduleRef);

    return moduleRef;
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

  public addProvider(token: string, metatype: Type | CustomProvider) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.getModuleByToken(token);
    moduleRef.addProvider(metatype);
  }

  public bindGlobalModules() {
    for (const [token, module] of this.modules) {
      this.addGlobalModulesAsImport(module);
    }
  }

  private addGlobalModulesAsImport(moduleRef: Module) {
    this.globalModules.forEach((module) => {
      if (module !== moduleRef) {
        module.addImport(moduleRef);
      }
    });
  }

  public getDynamicModuleMetadataByToken<T extends keyof DynamicModule>(
    token: string,
    metadataKey: T
  ): DynamicModule[T] | [] {
    const metadata = this.dynamicModuleMetadata.get(token);

    if (metadata && metadata[metadataKey]) {
      return metadata[metadataKey] as DynamicModule[T];
    }

    return [];
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

  private isDynamicModule(module: Type | DynamicModule) {
    return module && "module" in module;
  }

  public getInstanceOfProvider<T>(metatype: Type<T>): T {
    const data = this.globalInstanceHost.getInstance(metatype.name, "provider");

    return data.wrapper.instance as T;
  }

  public getGlobalExceptionHandlers() {
    return iterate(this.config.globalExceptionHandlers).toArray();
  }

  public getClientAdapter() {
    return this.config.clientAdapter;
  }
}
