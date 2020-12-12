import {
  DESIGN_PARAMETERS,
  IInjectableOptions,
  INJECTABLE_OPTIONS_METADATA,
  IReceiverOptions,
  MODULE_METADATA,
  RECEIVER_OPTIONS_METADATA,
  Type,
} from '@watson/common';

import { UnknownProviderException } from '../exceptions';
import { WatsonContainer } from '../watson-container';
import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

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

  public resolveDependencies() {
    const modules = this.container.getModules();

    for (const [token, module] of modules) {
      const { receivers, injectables } = module;

      for (const receiver of receivers.values()) {
        this.resolveConstructorParams(module, receiver);
      }

      for (const injectable of injectables.values()) {
        this.resolveConstructorParams(module, injectable);
      }
    }
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

      this.addImports(token, imports);
      this.addExports(token, exports);
      this.addProviders(token, providers);
      this.addReceivers(token, receivers);
    }
  }

  private addImports(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) => this.container.addImport(token, metatype));
  }

  private addExports(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) => this.container.addExport(token, metatype));
  }

  /**
   * Provider imports in the Module only support injectables for now.
   * Therefore they're directly added to the injectables map on the module
   */
  private addProviders(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) =>
      this.container.addInjectable(token, metatype)
    );
  }

  private addReceivers(token: string, metatypes: Type[]) {
    metatypes.forEach((metatype) =>
      this.container.addReceiver(token, metatype)
    );
  }

  private scanForModuleImports(metatype: Type) {
    const { imports } = this.resolveModuleMetadata(metatype);

    for (const module of imports) {
      if (module === undefined) {
        continue;
      }

      if (this.container.hasModule(module)) {
        continue;
      }

      this.container.addModule(module);
      this.scanForModuleImports(module);
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

  public resolveConstructorParams(
    module: Module,
    wrapper: InstanceWrapper
  ): void {
    const params = this.resolveMetadata<Type[]>(
      DESIGN_PARAMETERS,
      wrapper.metatype
    );

    if (params.length === 0) {
      return;
    }

    for (const [idx, metatype] of params.entries()) {
      if (!module.providers.has(metatype.name)) {
        throw new UnknownProviderException(metatype.name, module.name);
      }

      const provider = module.providers.get(metatype.name);
      wrapper.addCtorMetadata(idx, provider);
    }
  }

  public resolveModuleMetadata(target: Type) {
    const imports = this.resolveMetadata(
      MODULE_METADATA.IMPORTS,
      target
    ) as Type[];
    const providers = this.resolveMetadata(
      MODULE_METADATA.PROVIDERS,
      target
    ) as Type[];
    const receivers = this.resolveMetadata(
      MODULE_METADATA.RECEIVER,
      target
    ) as Type[];
    const exports = this.resolveMetadata(
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

  private resolveMetadata<T>(metadataKey: any, target: Type): T | [] {
    return Reflect.getMetadata(metadataKey, target) || [];
  }

  public resolveComponentMetadata(target: Object): IReceiverOptions {
    return Reflect.getMetadata(
      RECEIVER_OPTIONS_METADATA,
      target
    ) as IReceiverOptions;
  }
}
