import { CustomProvider, DynamicModule, isEmpty, isNil, isString, MODULE_GLOBAL_METADATA, Type } from '@watsonjs/common';
import iterate from 'iterare';

import { ApplicationConfig } from './application-config';
import { CommandContainer } from './command';
import { UnknownModuleException } from './exceptions';
import { CommandTokenFactory, ModuleTokenFactory } from './helpers';
import { GlobalInstanceHost, Module } from './injector';
import { CommandRoute } from './routes';

/**
 * Contains application state such as modules and provides an interface to get update / retrieve them
 */
export class WatsonContainer {
  private readonly modules = new Map<string, Module>();
  private readonly commands: CommandContainer;
  public config: ApplicationConfig;
  private moduleTokenFactory = new ModuleTokenFactory();
  private commandTokenFactory = new CommandTokenFactory();
  public globalInstanceHost = new GlobalInstanceHost(this);
  private readonly globalModules = new Set<Module>();
  private dynamicModuleMetadata = new Map<string, Partial<DynamicModule>>();

  private rootModule: Module;

  constructor(config: ApplicationConfig) {
    this.config = config;
    this.commands = new CommandContainer(this.commandTokenFactory);
  }

  public getModules() {
    return this.modules;
  }

  public getCommands() {
    return this.commands;
  }

  public addModule(
    metatype: Type | DynamicModule,
    forwardRef: Type[] | DynamicModule[] | Type
  ) {
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

    if (this.isRootModule(forwardRef)) {
      this.setRootModule(token);
    }

    return token;
  }

  public addCommand(command: CommandRoute) {
    this.commands.apply(command);
  }

  public hasCommand(command: CommandRoute) {
    const token = this.commandTokenFactory.create(command);
    return this.commands.get(token);
  }

  public isGlobalModule(module: Type | DynamicModule) {
    if (this.isDynamicModule(module) && (module as DynamicModule).global) {
      return true;
    }

    return Reflect.getMetadata(MODULE_GLOBAL_METADATA, module);
  }

  private isRootModule(forwardRef: Type[] | DynamicModule[] | Type) {
    if (isNil(forwardRef)) {
      return true;
    }

    if (Array.isArray(forwardRef) && isEmpty(forwardRef)) {
      return true;
    }

    return false;
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

  public addExport(token: string, metatype: Type | CustomProvider) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.modules.get(token);
    const exportedModuleToken = this.moduleTokenFactory.getTokenByModuleType(
      metatype as Type
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

  public setRootModule(token: string) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.getModuleByToken(token);
    this.rootModule = moduleRef;
  }

  public hasModule(metatype: Type) {
    return !!this.moduleTokenFactory.getTokenByModuleType(metatype);
  }

  private isDynamicModule(module: Type | DynamicModule) {
    return module && "module" in module;
  }

  public getInstanceOfProvider<T>(metatype: Type<T> | string): T {
    const token = isString(metatype) ? metatype : metatype.name;
    const data = this.globalInstanceHost.getInstance(token, "provider");

    return data.wrapper.instance as T;
  }

  public getInstanceInRootModule<T extends Type>(metatype: T) {
    const instance = this.globalInstanceHost.getInstanceInModule(
      this.rootModule,
      metatype
    );

    return instance;
  }

  public getGlobalExceptionHandlers() {
    return iterate(this.config.globalExceptionHandlers).toArray();
  }

  public getClientAdapter() {
    return this.config.clientAdapter;
  }

  public getRootModule() {
    return this.rootModule;
  }
}
