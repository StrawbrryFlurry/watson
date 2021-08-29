import {
  CustomProvider,
  DESIGN_PARAMETERS,
  DynamicModule,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  IInjectValue,
  INJECT_DEPENDENCY_METADATA,
  isFunction,
  MODULE_METADATA,
  PIPE_METADATA,
  PREFIX_METADATA,
  Type,
} from '@watsonjs/common';

import { CircularDependencyException, InvalidDynamicModuleException } from '../exceptions';
import {
  ADD_MODULE,
  BIND_GLOBAL_MODULES,
  COMPLETED,
  Logger,
  REFLECT_MODULE_COMPONENTS,
  REFLECT_MODULE_IMPORTS,
} from '../logger';
import { WatsonContainer } from '../watson-container';

export interface MethodDescriptors {
  [methodName: string]: PropertyDescriptor;
}

export interface MethodValue {
  name: string;
  descriptor: Function;
}

/**
 * TODO:
 * - Update this class to be more widely applicable
 * - Abstract the module logic to a new class
 * - Rename to `Reflector` or smth.
 */
export class MetadataResolver {
  private container: WatsonContainer;
  private logger = new Logger("ModuleLoader");

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  /**
   * Resolves the root module to recursively add its imports to the container
   */
  public async resolveRootModule(metatype: Type) {
    this.logger.logMessage(REFLECT_MODULE_IMPORTS());
    await this.scanForModuleImports(metatype);
    this.logger.logMessage(COMPLETED());
    this.logger.logMessage(REFLECT_MODULE_COMPONENTS());
    await this.resolveModuleProperties();
    this.logger.logMessage(BIND_GLOBAL_MODULES());
    this.container.bindGlobalModules();
  }

  public async createTestingModule(moduelRef: DynamicModule) {
    await this.scanForModuleImports(moduelRef);
    await this.resolveModuleProperties();
    this.container.bindGlobalModules();
  }

  private async resolveModuleProperties() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      const { imports, exports, providers, receivers } =
        await this.reflectModuleMetadata(metatype);

      this.reflectProviders(token, providers);
      this.reflectReceivers(token, receivers);
      this.reflectImports(token, imports as Type[]);
      this.reflectExports(token, exports);
    }
  }

  private reflectImports(token: string, imports: Type[]) {
    [
      ...imports,
      ...this.container.getDynamicModuleMetadataByToken(token, "imports"),
    ].forEach((_import) => this.container.addImport(token, _import as Type));
  }

  private reflectExports(token: string, exports: (Type | CustomProvider)[]) {
    [
      ...exports,
      ...this.container.getDynamicModuleMetadataByToken(token, "exports"),
    ].forEach((_export) => this.container.addExport(token, _export));
  }

  private reflectProviders(
    token: string,
    providers: (Type | CustomProvider)[]
  ) {
    [
      ...providers,
      ...this.container.getDynamicModuleMetadataByToken(token, "providers"),
    ].forEach((provider) => {
      this.reflectDynamicMetadata(provider as any, token);
      this.container.addProvider(token, provider);
    });
  }

  private reflectReceivers(token: string, receivers: Type[]) {
    [
      ...receivers,
      ...this.container.getDynamicModuleMetadataByToken(token, "receivers"),
    ].forEach((receiver) => {
      this.reflectDynamicMetadata(receiver, token);
      this.container.addReceiver(token, receiver);
    });
  }

  private reflectDynamicMetadata(metatype: Type, token: string) {
    if (!metatype || !metatype.prototype) {
      return;
    }

    this.reflectComponentInjectables(metatype, token, GUARD_METADATA);
    this.reflectComponentInjectables(metatype, token, PIPE_METADATA);
    this.reflectComponentInjectables(metatype, token, FILTER_METADATA);
    this.reflectComponentInjectables(
      metatype,
      token,
      EXCEPTION_HANDLER_METADATA
    );
    this.reflectComponentInjectables(metatype, token, PREFIX_METADATA);
  }

  private reflectComponentInjectables(
    metatype: Type,
    token: string,
    metadataKey: string
  ) {
    const prototypeInjectables = this.getArrayMetadata<any[]>(
      metadataKey,
      metatype
    );
    const prototypeMethods = this.reflectMethodsFromMetatype(metatype);

    const methodInjectables = prototypeMethods
      .map((method) =>
        this.getArrayMetadata(metadataKey, method.descriptor as Type)
      )
      .filter((e) => typeof e !== "undefined");

    const flattenMethodInjectables = this.flatten(
      methodInjectables as unknown[][]
    );
    const injectables = [
      ...prototypeInjectables,
      ...flattenMethodInjectables,
    ].filter(isFunction);

    injectables.forEach((injectable) => {
      this.container.addInjectable(token, injectable);
    });
  }

  private async scanForModuleImports(
    metatype: Type | DynamicModule,
    context: (Type | DynamicModule)[] = []
  ) {
    this.container.addModule(metatype, context);

    context.push(metatype);

    const { imports, metatype: type } = await this.reflectModuleMetadata(
      metatype
    );

    this.logger.logMessage(ADD_MODULE(type));

    for (let module of imports) {
      if (module instanceof Promise) {
        module = await module;
      }

      if (typeof module === "undefined") {
        throw new CircularDependencyException(
          "Injector",
          type,
          context as Type[]
        );
      }

      if (this.container.hasModule(module)) {
        continue;
      }

      this.container.addModule(module, context);
      await this.scanForModuleImports(module, context);
    }
  }

  public reflectMethodParams(
    target: Type,
    propertyKey: string | symbol
  ): unknown[] {
    return Reflect.getMetadata(
      DESIGN_PARAMETERS,
      target.constructor,
      propertyKey
    );
  }

  public reflectModuleMetadata(target: Type | DynamicModule) {
    if (this.isDynamicModule(target as DynamicModule)) {
      return this.reflectDynamicModule(target as DynamicModule & Type);
    }

    const imports = this.getArrayMetadata<Type[]>(
      MODULE_METADATA.IMPORTS,
      target as Type
    );
    const providers = this.getArrayMetadata<Type[]>(
      MODULE_METADATA.PROVIDERS,
      target as Type
    );
    const receivers = this.getArrayMetadata<Type[]>(
      MODULE_METADATA.RECEIVER,
      target as Type
    );
    const exports = this.getArrayMetadata<Type[]>(
      MODULE_METADATA.EXPORTS,
      target as Type
    );

    return {
      imports,
      providers,
      receivers,
      exports,
      metatype: target as Type,
    };
  }

  private async reflectDynamicModule(dynamicModule: DynamicModule & Type) {
    const moduleData = await dynamicModule;

    if (!moduleData) {
      throw new InvalidDynamicModuleException(
        "MetadataResolver",
        `The dynamic module ${dynamicModule.name} did not return valid module metadata.`
      );
    }

    const metatype = moduleData.module;
    const imports = moduleData.imports || [];
    const exports = moduleData.exports || [];
    const providers = moduleData.providers || [];
    const receivers = moduleData.receivers || [];

    return {
      metatype,
      imports,
      exports,
      providers,
      receivers,
    };
  }

  /**
   * The same as getMetadata but provides an empty array as fallback
   */
  public getArrayMetadata<T>(
    metadataKey: string,
    target: Type | Function
  ): T | [] {
    return Reflect.getMetadata(metadataKey, target) || [];
  }

  public getMetadata<T>(metadataKey: string, target: Type | Function): T;
  public getMetadata<T>(
    metadataKey: string,
    target: Type,
    propertyKey?: string
  ): T;
  public getMetadata<T>(
    metadataKey: string,
    target: Type,
    propertyKey?: string
  ): T {
    if (propertyKey) {
      return Reflect.getMetadata(metadataKey, target.constructor, propertyKey);
    }

    return Reflect.getMetadata(metadataKey, target);
  }

  public reflectInjectedProvider(target: Type, ctorIndex: number) {
    const injectValue =
      this.getMetadata<IInjectValue[]>(INJECT_DEPENDENCY_METADATA, target) ||
      [];

    for (const value of injectValue) {
      if (value.parameterIndex === ctorIndex) {
        return value.provide;
      }
    }

    return null;
  }

  public reflectMethodsFromMetatype(metatype: Type): MethodValue[] {
    if (typeof metatype.prototype === "undefined") {
      return;
    }

    const prototypeMethods = Object.getOwnPropertyDescriptors(
      metatype.prototype
    );

    return this.filterAndFormatPrototypeMethods(
      metatype.name,
      prototypeMethods
    );
  }

  /**
   * Removes ctor descriptor and removes unnecessairy information.
   * @example
   *constructor: {
   *    value: [class CatReceiver],
   *      writable: true,
   *      enumerable: false,
   *    configurable: true
   * }
   * getCat: {
   *   value: [Function: getCat],
   *   writable: true,
   *   enumerable: false,
   *   configurable: true
   *  }
   *}
   */
  private filterAndFormatPrototypeMethods(
    ctorName: string,
    prototypeMethods: MethodDescriptors
  ) {
    const methods = Object.entries(prototypeMethods).filter(([name]) => {
      if (name === "constructor") {
        return false;
      }

      if (ctorName === name) {
        return false;
      }

      return true;
    });

    return methods.map(([name, descriptor]) => ({
      name: name,
      descriptor: descriptor.value as Type,
    }));
  }

  private isDynamicModule(module: DynamicModule): module is DynamicModule {
    return module && "module" in module;
  }

  private flatten<T>(arr: T[][]): T[] {
    return arr.reduce((a: T[], b: T[]) => [...a, ...b], []);
  }
}
