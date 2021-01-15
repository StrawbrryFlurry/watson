import {
  CustomProvider,
  DESIGN_PARAMETERS,
  DynamicModule,
  FILTER_METADATA,
  GUARD_METADATA,
  IInjectValue,
  INJECT_DEPENDENCY_METADATA,
  isFunction,
  MODULE_METADATA,
  PIPE_METADATA,
  Type,
} from '@watson/common';

import { CircularDependencyException } from '../exceptions';
import { InvalidDynamicModuleException } from '../exceptions/invalid-dynamic-module.exception';
import { WatsonContainer } from '../watson-container';

export interface IMethodDescriptors {
  [methodName: string]: PropertyDescriptor;
}

export interface IMethodValue {
  name: string;
  descriptor: Function;
}

export class MetadataResolver {
  private container: WatsonContainer;

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  /**
   * Resolves the root module to recursively add its imports to the container
   */
  public async resolveRootModule(metatype: Type) {
    await this.scanForModuleImports(metatype);
    await this.resolveModuleProperties();

    this.container.bindGlobalModules();
  }

  private async resolveModuleProperties() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      const {
        imports,
        exports,
        providers,
        receivers,
      } = await this.reflectModuleMetadata(metatype);

      this.reflectProviders(token, providers);
      this.reflectReceivers(token, receivers);
      this.reflectImports(token, imports);
      this.reflectExports(token, exports);
    }
  }

  private reflectImports(token: string, imports: Type[]) {
    [
      ...imports,
      ...this.container.getDynamicModuleMetadataByToken(token, "imports"),
    ].forEach((_import) => this.container.addImport(token, _import));
  }

  private reflectExports(token: string, exports: Type[]) {
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

  private async scanForModuleImports(metatype: Type, context: Type[] = []) {
    context.push(metatype);
    this.container.addModule(metatype);

    const { imports } = await this.reflectModuleMetadata(metatype);

    for (let module of imports) {
      if (typeof module === "undefined") {
        throw new CircularDependencyException("Injector", metatype, context);
      }

      if (this.container.hasModule(module)) {
        continue;
      }

      this.container.addModule(module);
      await this.scanForModuleImports(module, context);
    }
  }

  public reflectMethodParams(
    target: Type,
    propertyKey: string | symbol
  ): unknown[] {
    return Reflect.getMetadata(DESIGN_PARAMETERS, target, propertyKey);
  }

  public reflectModuleMetadata(target: Type) {
    if (this.isDynamicModule(target as any)) {
      return this.reflectDynamicModule(target as any);
    }

    const imports = this.getArrayMetadata(
      MODULE_METADATA.IMPORTS,
      target
    ) as Type[];
    const providers = this.getArrayMetadata(
      MODULE_METADATA.PROVIDERS,
      target
    ) as Type[];
    const receivers = this.getArrayMetadata(
      MODULE_METADATA.RECEIVER,
      target
    ) as Type[];
    const exports = this.getArrayMetadata(
      MODULE_METADATA.EXPORTS,
      target
    ) as Type[];

    return {
      imports,
      providers,
      receivers,
      exports,
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

    return { metatype, imports, exports, providers, receivers };
  }

  /**
   * The same as getMetadata but provides an empty array as fallback
   */
  public getArrayMetadata<T>(metadataKey: string, target: Type): T | [] {
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
      return Reflect.getMetadata(metadataKey, target, propertyKey);
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

  public reflectMethodsFromMetatype(metatype: Type): IMethodValue[] {
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
    prototypeMethods: IMethodDescriptors
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

  private isDynamicModule(module: DynamicModule) {
    return module && "module" in module;
  }

  private flatten<T>(arr: T[][]): T[] {
    return arr.reduce((a: T[], b: T[]) => [...a, ...b], []);
  }
}
