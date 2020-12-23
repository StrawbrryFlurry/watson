import {
  DESIGN_PARAMETERS,
  IInjectableOptions,
  IInjectValue,
  INJECT_DEPENDENCY_METADATA,
  INJECTABLE_OPTIONS_METADATA,
  MODULE_METADATA,
  Type,
} from '@watson/common';

import { CircularDependencyException } from '../exceptions';
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
  public resolveRootModule(metatype: Type) {
    this.scanForModuleImports(metatype);
    this.resolveModuleProperties();
  }

  private resolveModuleProperties() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      const {
        imports,
        exports,
        providers,
        receivers,
      } = this.resolveModuleMetadata(metatype);

      this.addInjectables(token, providers);
      this.addReceivers(token, receivers);
      this.addImports(token, imports);
      this.addExports(token, exports);
    }
  }

  private addImports(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) => this.container.addImport(token, metatype));
  }

  private addExports(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) => this.container.addExport(token, metatype));
  }

  private addInjectables(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) =>
      this.container.addInjectable(token, metatype)
    );
  }

  private addReceivers(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) =>
      this.container.addReceiver(token, metatype)
    );
  }

  private scanForModuleImports(metatype: Type, context: Type[] = []) {
    context.push(metatype);
    const { imports } = this.resolveModuleMetadata(metatype);

    for (const module of imports) {
      if (typeof module === "undefined") {
        throw new CircularDependencyException("Injector", metatype, context);
      }

      if (this.container.hasModule(module)) {
        continue;
      }

      this.container.addModule(module);
      this.scanForModuleImports(module, context);
    }
  }

  public resolveInjectableMetadata(target: Object): IInjectableOptions {
    return Reflect.getMetadata(
      INJECTABLE_OPTIONS_METADATA,
      target
    ) as IInjectableOptions;
  }

  public resolveMethodPrams(
    target: Type,
    propertyKey: string | symbol
  ): unknown[] {
    return Reflect.getMetadata(DESIGN_PARAMETERS, target, propertyKey);
  }

  public resolveModuleMetadata(target: Type) {
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

  public getArrayMetadata<T>(metadataKey: string, target: Type): T | [] {
    return Reflect.getMetadata(metadataKey, target) || [];
  }

  public getMetadata<T>(metadataKey: string, target: Type): T;
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

  public resolveInjectedProvider(target: Type, ctorIndex: number) {
    const injectValue = this.getArrayMetadata<IInjectValue>(
      INJECT_DEPENDENCY_METADATA,
      target
    );

    if (Array.isArray(injectValue)) {
      return null;
    }

    if (injectValue.parameterIndex === ctorIndex) {
      return injectValue.token;
    }

    return null;
  }

  public resolveMethodsFromMetatype(metatype: Type) {
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
}
