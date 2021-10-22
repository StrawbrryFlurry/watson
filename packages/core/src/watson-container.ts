import { Module } from '@core/di';
import {
  CommandRoute,
  CustomProvider,
  DynamicModule,
  isEmpty,
  isNil,
  isString,
  MODULE_GLOBAL_METADATA,
  Type,
} from '@watsonjs/common';
import iterate from 'iterare';

import { ApplicationConfig } from './application-config';
import { CommandContainer } from './command';
import { StaticInjector } from './di/static-injector';
import { UnknownModuleException } from './exceptions';
import { ModuleTokenFactory } from './util';

/**
 * Injection Container for the application
 */
export class WatsonContainer {
  private readonly _modules = new Map<string, Module>();
  private readonly commands: CommandContainer;
  public config: ApplicationConfig;
  private moduleTokenFactory = new ModuleTokenFactory();
  private dynamicModuleMetadata = new Map<string, Partial<DynamicModule>>();

  private rootInjector: StaticInjector;

  /**
   * DI tokens are static
   * properties on a provider
   * element which is used
   * to resolve that given
   * provider.
   *
   * - 1..n: Any provider registered by the user.
   * - 0: Internal watson providers.
   * - -1: Context providers that can only be found
   * in the context injector.
   */
  private _watsonDiTokenId = 1;

  /**
   * Returns the next DI token
   * id and increments it by 1
   */
  public get DI_TOKEN_ID() {
    const nextId = this._watsonDiTokenId;
    this._watsonDiTokenId += 1;
    return nextId;
  }

  constructor(config: ApplicationConfig) {
    this.config = config;
    this.commands = new CommandContainer();
  }

  public get modules() {
    return this._modules;
  }

  public getCommands(): CommandContainer {
    return this.commands;
  }

  public addModule(
    metatype: Type | DynamicModule,
    forwardRef: (Type | DynamicModule)[] | Type
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

    if (this.isRootModule(forwardRef as Type)) {
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

    return !isNil(Reflect.getMetadata(MODULE_GLOBAL_METADATA, module));
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

    const importedModuleToken =
      this.moduleTokenFactory.getTokenByModuleType(metatype);
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

  public getDynamicModuleMetadataByToken<
    K extends Exclude<keyof DynamicModule, "module" | "global">
  >(token: string, metadataKey: K): DynamicModule[K] | [] {
    const metadata = this.dynamicModuleMetadata.get(token);

    if (metadata && !isNil(metadata[metadataKey])) {
      return metadata[metadataKey] as DynamicModule[K];
    }

    return [];
  }

  public getModuleByToken(token: string): Module | null {
    return this.modules.get(token) ?? null;
  }

  public setRootModule(token: string) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException("WatsonContainer");
    }

    const moduleRef = this.getModuleByToken(token);
    this.rootModule = moduleRef;
  }

  public hasModule(metatype: Type | DynamicModule) {
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

  public generateTokenFromModule(module: Module) {
    const { metatype } = module;
    return this.moduleTokenFactory.generateModuleToken(metatype);
  }

  public getGlobalExceptionHandlers() {
    return iterate(this.config.globalExceptionHandlers).toArray();
  }

  public getClientAdapter() {
    return this.config.clientAdapter;
  }
}
