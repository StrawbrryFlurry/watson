import { Injector, ModuleDef, ModuleImpl, ModuleRef, ProviderResolvable, Reflector } from '@di';
import { CircularDependencyException, InvalidDynamicModuleException } from '@exceptions';
import { Logger } from '@logger';
import { resolveAsyncValue } from '@utils';
import {
  DynamicModule,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  InjectionToken,
  isDynamicModule,
  isFunction,
  isNil,
  MODULE_METADATA,
  optionalAssign,
  PIPE_METADATA,
  PREFIX_METADATA,
  Type,
  UniqueTypeArray,
  WATSON_MODULE_PROV,
} from '@watsonjs/common';

import { ModuleContainer } from './module-container';

export const BOOTSTRAP_MODULE_PROVIDERS = new InjectionToken(
  "Used to provide a set of metadata keys that should be considered by the `ModuleLoader` when scanning module providers",
  {
    providedIn: "root",
  }
);

/**
 * Resolves module dependencies
 * and adds them to the di container.
 */
export class ModuleLoader {
  private _reflector = new Reflector();
  private _logger = new Logger("ModuleLoader");
  private _injector: Injector;

  constructor(injector: Injector) {
    this._injector = injector;
  }

  /**
   * Resolves the root module to recursively add its imports to the container
   */
  public async resolveRootModule(metatype: Type) {
    const modules = await this.scanModuleRecursively(metatype);
    this.traverseModuleMap(metatype, modules);
  }

  private async scanModuleRecursively(
    metatype: Type | DynamicModule,
    resolved = new Map<Type, ModuleDef>(),
    ctx: Type[] = []
  ): Promise<Map<Type, ModuleDef>> {
    const {
      imports,
      metatype: type,
      exports,
      providers,
      receivers,
    } = await this.reflectModuleMetadata(metatype);

    ctx.push(type);

    const _imports = (await Promise.all(
      imports.map(async (module) =>
        isDynamicModule(await module)
          ? (module as DynamicModule).module
          : module
      )
    )) as Type[];

    const moduleDef: ModuleDef = {
      metatype: type,
      exports,
      imports: _imports,
      providers,
      receivers,
    };

    resolved.set(type, moduleDef);

    await Promise.all(
      (imports as (Type | DynamicModule)[]).map((module) => {
        const importType = isDynamicModule(module) ? module.module : module;

        if (isNil(module) || ctx.includes(importType)) {
          throw new CircularDependencyException("ModuleLoader", type, ctx);
        }

        if (resolved.has(importType)) {
          return;
        }

        return this.scanModuleRecursively(module as Type, resolved);
      })
    );

    ctx.pop();

    return resolved;
  }

  private async traverseModuleMap(
    rootModule: Type,
    modules: Map<Type, ModuleDef>
  ): Promise<void> {
    const container = await this._injector.get(ModuleContainer);

    const rootDef = modules.get(rootModule)!;

    // Calling this method on the root module
    // should resolve injector providers for all
    // other modules as well.
    this.recursivelyResolveModuleProviders(rootDef, modules);

    const rootRef = new ModuleImpl(
      rootModule,
      this._injector,
      this._injector,
      rootDef
    );

    const createModuleRecursively = (
      parentDef: ModuleDef,
      parentRef: ModuleRef
    ) => {
      const { imports } = parentDef;

      for (const _import of imports) {
        const childDef = modules.get(_import)!;

        const childRef = new ModuleImpl(
          childDef.metatype,
          this._injector,
          parentRef,
          childDef
        );

        container.apply(childRef);
        createModuleRecursively(childDef, childRef);
      }
    };

    createModuleRecursively(rootDef, rootRef);
  }

  private recursivelyResolveModuleProviders(
    moduleDef: ModuleDef,
    modules: Map<Type, ModuleDef>
  ): ProviderResolvable[] {
    const { imports, providers, metatype } = moduleDef;
    const moduleProviders: ProviderResolvable[] = [...providers];

    if (!isNil(metatype[WATSON_MODULE_PROV])) {
      return metatype[WATSON_MODULE_PROV];
    }

    const resolveExports = (module: ModuleDef): ProviderResolvable[] => {
      const { imports, exports, providers, metatype } = module;
      const __ctx = [];

      if (!isNil(metatype[WATSON_MODULE_PROV])) {
        moduleProviders.push(...metatype[WATSON_MODULE_PROV]);
        return metatype[WATSON_MODULE_PROV];
      }

      const injectables = this.reflectModuleInjectables(moduleDef);
      moduleProviders.push(...injectables);

      // If the module exports itself,
      // export all of it's providers
      if (exports.includes(metatype)) {
        moduleProviders.push(...providers);
        __ctx.push(...providers);
      }

      // Check for module re-exporting
      for (const _export of exports) {
        const moduleDef = modules.get(_export as Type);

        if (isNil(moduleDef)) {
          moduleProviders.push(_export);
          continue;
        }

        if (!imports.includes(moduleDef.metatype)) {
          throw `ModuleLoader: Could not find an import for the exported module ${moduleDef.metatype.name}`;
        }

        const exportCtx = resolveExports(moduleDef);
        __ctx.push(...exportCtx);
      }

      return optionalAssign(metatype, WATSON_MODULE_PROV, __ctx);
    };

    const injectables = this.reflectModuleInjectables(moduleDef);
    moduleProviders.push(...injectables);

    for (const _import of imports) {
      const importDef = modules.get(_import);

      if (isNil(importDef)) {
        throw `ModuleLoader: COuld not find a corresponding module for import ${_import.name}`;
      }

      optionalAssign(_import, WATSON_MODULE_PROV, resolveExports(importDef));
    }

    optionalAssign(metatype, WATSON_MODULE_PROV, moduleProviders);
    return moduleProviders;
  }

  private reflectModuleInjectables(moduleDef: ModuleDef) {
    const { receivers } = moduleDef;
    const providers = new UniqueTypeArray<ProviderResolvable>();

    for (const receiver of receivers) {
      providers.add(...this.reflectInjectables(receiver));
    }

    return providers;
  }

  public reflectModuleMetadata(target: Type | DynamicModule) {
    if (isDynamicModule(target as DynamicModule)) {
      return this.getDataFromDynamicModule(target as DynamicModule & Type);
    }

    const imports =
      Reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.IMPORTS,
        target as Type
      ) ?? [];
    const providers =
      Reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.PROVIDERS,
        target as Type
      ) ?? [];
    const receivers =
      Reflector.reflectMetadata<Type[]>(
        MODULE_METADATA.RECEIVER,
        target as Type
      ) ?? [];
    const exports =
      Reflector.reflectMetadata<Type[]>(
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

  private reflectInjectables(
    metatype: Type
  ): UniqueTypeArray<ProviderResolvable> {
    const injectables = new UniqueTypeArray<ProviderResolvable>();

    if (isNil(metatype) || isNil(metatype.prototype)) {
      return injectables;
    }

    this.reflectComponentInjectables(metatype, injectables, GUARD_METADATA);
    this.reflectComponentInjectables(metatype, injectables, PIPE_METADATA);
    this.reflectComponentInjectables(metatype, injectables, FILTER_METADATA);
    this.reflectComponentInjectables(
      metatype,
      injectables,
      EXCEPTION_HANDLER_METADATA
    );
    this.reflectComponentInjectables(metatype, injectables, PREFIX_METADATA);

    return injectables;
  }

  private reflectComponentInjectables(
    metatype: Type,
    resolved: UniqueTypeArray<ProviderResolvable>,
    metadataKey: string
  ): void {
    const prototypeInjectables =
      Reflector.reflectMetadata<any[]>(metadataKey, metatype) ?? [];

    const prototypeMethods = Reflector.reflectMethodsOfType(metatype);

    const methodInjectables = prototypeMethods
      .map(
        (method) =>
          Reflector.reflectMetadata<any[]>(metadataKey, method.descriptor) ?? []
      )
      .filter((e) => !isNil(e));

    const injectables = [
      ...prototypeInjectables,
      ...methodInjectables.flat(),
    ].filter(isFunction);

    resolved.add(...injectables);
  }
}
