import { Reflector } from '@di';
import { CircularDependencyException, InvalidDynamicModuleException } from '@exceptions';
import { ADD_MODULE, COMPLETED, Logger, REFLECT_MODULE_COMPONENTS, REFLECT_MODULE_IMPORTS } from '@logger';
import { resolveAsyncValue } from '@utils';
import {
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  INJECT_DEPENDENCY_METADATA,
  MODULE_METADATA,
  PIPE_METADATA,
  PREFIX_METADATA,
} from 'packages/common/src/constants';
import { InjectMetadata, isDynamicModule } from 'packages/common/src/decorators';
import { CustomProvider, DynamicModule, Type } from 'packages/common/src/interfaces';
import { isFunction, isNil } from 'packages/common/src/utils';

import { WatsonContainer } from '..';

/**
 * Resolves module dependencies
 * and adds them to the di container.
 */
export class ModuleLoader {
  private _reflector = new Reflector();
  private _logger = new Logger("ModuleLoader");
  private _container: WatsonContainer;

  constructor(container: WatsonContainer) {
    this._container = container;
  }

  /**
   * Resolves the root module to recursively add its imports to the container
   */
  public async resolveRootModule(metatype: Type) {
    this._logger.logMessage(REFLECT_MODULE_IMPORTS());
    await this.scanForModuleImports(metatype);
    this._logger.logMessage(COMPLETED());
    this._logger.logMessage(REFLECT_MODULE_COMPONENTS());
    await this.resolveModuleProperties();
  }

  private async scanForModuleImports(
    metatype: Type | DynamicModule,
    context: (Type | DynamicModule)[] = []
  ) {
    this._container.addModule(metatype, context);

    context.push(metatype);

    const { imports, metatype: type } = await this.reflectModuleMetadata(
      metatype
    );

    this._logger.logMessage(ADD_MODULE(type));

    for (let module of imports) {
      if (module instanceof Promise) {
        module = await module;
      }

      if (typeof module === "undefined") {
        throw new CircularDependencyException(
          "ModuleLoader",
          type,
          context as Type[]
        );
      }

      if (this._container.hasModule(module)) {
        continue;
      }

      this._container.addModule(module, context);
      await this.scanForModuleImports(module, context);
    }
  }

  public reflectModuleMetadata(target: Type | DynamicModule) {
    if (isDynamicModule(target as DynamicModule)) {
      return this.getDataFromDynamicModule(target as DynamicModule & Type);
    }

    const imports =
      this._reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.IMPORTS,
        target as Type
      ) ?? [];
    const providers =
      this._reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.PROVIDERS,
        target as Type
      ) ?? [];
    const receivers =
      this._reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.RECEIVER,
        target as Type
      ) ?? [];
    const exports =
      this._reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.EXPORTS,
        target as Type
      ) ?? [];

    return {
      imports,
      providers,
      receivers,
      exports,
      metatype: target as Type,
    };
  }

  private async getDataFromDynamicModule(dynamicModule: DynamicModule & Type) {
    const moduleData = await resolveAsyncValue(dynamicModule);

    if (isNil(moduleData)) {
      throw new InvalidDynamicModuleException(
        "ModuleLoader",
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

  public reflectInjectedProvider(target: Type, ctorIndex: number) {
    const injectValue =
      this._reflector.reflectMetadata<InjectMetadata[]>(
        INJECT_DEPENDENCY_METADATA,
        target
      ) || [];

    for (const value of injectValue) {
      if (value.parameterIndex === ctorIndex) {
        return value.provide;
      }
    }

    return null;
  }

  private async resolveModuleProperties() {
    const { modules } = this._container;

    for (const [token, { metatype }] of modules) {
      const { imports, exports, providers, receivers } =
        await this.reflectModuleMetadata(metatype);

      this.reflectProviders(token, providers);
      this.reflectReceivers(token, receivers);
      this.reflectImports(token, imports as Type[]);
      this.reflectExports(token, exports);
    }
  }

  private getDynamicModuleMetadataByKey<
    K extends Exclude<keyof DynamicModule, "global" | "module">
  >(token: string, key: K) {
    return Promise.all(
      this._container.getDynamicModuleMetadataByToken(token, key) as any[]
    );
  }

  private async reflectImports(token: string, imports: Type[]) {
    const dynamicModuleImports = await this.getDynamicModuleMetadataByKey(
      token,
      "imports"
    );

    [...imports, ...dynamicModuleImports].forEach((_import) =>
      this._container.addImport(token, _import as Type)
    );
  }

  private async reflectExports(
    token: string,
    exports: (Type | CustomProvider)[]
  ) {
    const dynamicModuleExports = await this.getDynamicModuleMetadataByKey(
      token,
      "exports"
    );

    [...exports, ...dynamicModuleExports].forEach((_export) =>
      this._container.addExport(token, _export)
    );
  }

  private async reflectProviders(
    token: string,
    providers: (Type | CustomProvider)[]
  ) {
    const dynamicModuleProviders = await this.getDynamicModuleMetadataByKey(
      token,
      "providers"
    );

    [...providers, ...dynamicModuleProviders].forEach((provider) => {
      this.reflectDynamicMetadata(provider as any, token);
      this._container.addProvider(token, provider);
    });
  }

  private async reflectReceivers(token: string, receivers: Type[]) {
    const dynamicModuleReceivers = await this.getDynamicModuleMetadataByKey(
      token,
      "receivers"
    );

    [...receivers, ...dynamicModuleReceivers].forEach((receiver) => {
      this.reflectDynamicMetadata(receiver, token);
      this._container.addReceiver(token, receiver);
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
    const prototypeInjectables =
      this._reflector.reflectMetadata<any[]>(metadataKey, metatype) ?? [];

    const prototypeMethods = this._reflector.reflectMethodsOfType(metatype);

    const methodInjectables = prototypeMethods
      .map(
        (method) =>
          this._reflector.reflectMetadata<any[]>(
            metadataKey,
            method.descriptor as Type
          ) ?? []
      )
      .filter((e) => typeof e !== "undefined");

    const injectables = [
      ...prototypeInjectables,
      ...methodInjectables.flat(),
    ].filter(isFunction);

    injectables.forEach((injectable) => {
      this._container.addInjectable(token, injectable);
    });
  }
}
