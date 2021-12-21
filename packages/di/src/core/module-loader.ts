import {
  MODULE_DEFINITION_METADATA,
  MODULE_REF_IMPL_METADATA,
} from "@di/constants";
import { Injector, ProviderResolvable } from "@di/core/injector";
import { ModuleDef, ModuleRef, ɵModuleRefImpl } from "@di/core/module-ref";
import { Reflector } from "@di/core/reflector";
import { isDynamicModule, WatsonModuleOptions } from "@di/decorators";
import { W_MODULE_PROV } from "@di/fields";
import { WatsonDynamicModule } from "@di/providers";
import { Type } from "@di/types";
import { optionalAssign, resolveAsyncValue } from "@di/utils";
import { isNil } from "@di/utils/common";

import { ModuleContainer } from "./module-container";

/**
 * Resolves module dependencies
 * and adds them to the di container.
 */
export class ModuleLoader {
  private _injector: Injector;

  constructor(injector: Injector) {
    this._injector = injector;
  }

  /**
   * Resolves the root module to recursively add its imports to the container
   */
  public async resolveRootModule(metatype: Type) {
    const modules = await this.scanModuleRecursively(metatype);
    await this.bindModuleProvidersAndCreateModuleRef(metatype, modules);
  }

  private async scanModuleRecursively(
    metatype: Type | WatsonDynamicModule,
    resolved = new Map<Type, ModuleDef>(),
    ctx: Type[] = []
  ): Promise<Map<Type, ModuleDef>> {
    const {
      imports,
      metatype: type,
      exports,
      providers,
      components,
    } = await this.reflectModuleMetadata(metatype);

    ctx.push(type);

    const _imports = (await Promise.all(
      imports.map(async (module) =>
        isDynamicModule(await module)
          ? (module as WatsonDynamicModule).module
          : module
      )
    )) as Type[];

    const moduleDef: ModuleDef = {
      metatype: type,
      exports,
      imports: _imports,
      providers,
      components,
    };

    resolved.set(type, moduleDef);

    await Promise.all(
      (imports as (Type | WatsonDynamicModule)[]).map((module) => {
        const importType = isDynamicModule(module)
          ? (module as WatsonDynamicModule).module
          : module;

        if (isNil(module) || ctx.includes(importType)) {
          throw `Circular dependency detected`;
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

  private async bindModuleProvidersAndCreateModuleRef(
    rootModule: Type,
    modules: Map<Type, ModuleDef>
  ): Promise<void> {
    const container = await this._injector.get(ModuleContainer);
    const ModuleImpl = Reflector.reflectMetadata<typeof ɵModuleRefImpl>(
      MODULE_REF_IMPL_METADATA,
      Injector
    );

    if (isNil(ModuleImpl)) {
      throw "Could not find an Implementation for ModuleRef. Decorate a class that extends ModuleRef with `DeclareWatsonModuleRef()` to promote it to the application module ref.";
    }

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

  /**
   * Resolves all providers for `moduleDef`
   * recursively and stores them in the
   * static {@link W_MODULE_PROV} property of
   * the module type. This property can later
   * be read by other components to quickly
   * read all the modules providers including
   * imports.
   */
  private recursivelyResolveModuleProviders(
    moduleDef: ModuleDef,
    modules: Map<Type, ModuleDef>
  ): ProviderResolvable[] {
    const { imports, providers, metatype } = moduleDef;
    const moduleProviders: ProviderResolvable[] = [...providers];

    if (!isNil(metatype[W_MODULE_PROV])) {
      return metatype[W_MODULE_PROV];
    }

    const resolveExports = (module: ModuleDef): ProviderResolvable[] => {
      const { imports, exports, providers, metatype } = module;
      const exportProviders: ProviderResolvable[] = [];

      if (!isNil(metatype[W_MODULE_PROV])) {
        moduleProviders.push(...metatype[W_MODULE_PROV]);
        return metatype[W_MODULE_PROV];
      }

      // If the module exports itself,
      // export all of it's providers
      if (exports.includes(metatype)) {
        moduleProviders.push(...providers);
        exportProviders.push(...providers);
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

        const nestedExportProviders = resolveExports(moduleDef);
        exportProviders.push(...nestedExportProviders);
      }

      return optionalAssign(metatype, W_MODULE_PROV, exportProviders);
    };

    for (const _import of imports) {
      const importDef = modules.get(_import);

      if (isNil(importDef)) {
        throw `ModuleLoader: COuld not find a corresponding module for import ${_import.name}`;
      }

      optionalAssign(_import, W_MODULE_PROV, resolveExports(importDef));
    }

    optionalAssign(metatype, W_MODULE_PROV, moduleProviders);
    return moduleProviders;
  }

  public reflectModuleMetadata(target: Type | WatsonDynamicModule) {
    if (isDynamicModule(target as WatsonDynamicModule)) {
      return this.getDataFromDynamicModule(
        target as WatsonDynamicModule & Type
      );
    }

    const { components, exports, imports, providers } =
      Reflector.reflectMetadata<WatsonModuleOptions>(
        MODULE_DEFINITION_METADATA,
        <Type>target
      );

    return {
      metatype: target as Type,
      imports: imports ?? [],
      providers: providers ?? [],
      components: components ?? [],
      exports: exports ?? [],
    };
  }

  private async getDataFromDynamicModule(
    WatsonDynamicModule: WatsonDynamicModule & Type
  ) {
    const dynamicModuleDef = await resolveAsyncValue(WatsonDynamicModule);

    if (isNil(dynamicModuleDef)) {
      throw `The dynamic module ${WatsonDynamicModule.name} did not return valid module metadata.`;
    }

    const { module, components, imports, providers, exports } =
      dynamicModuleDef;

    return {
      metatype: module,
      imports: imports ?? [],
      exports: exports ?? [],
      providers: providers ?? [],
      components: components ?? [],
    };
  }
}
