import { MODULE_DEFINITION_METADATA, MODULE_REF_IMPL_METADATA } from '@di/constants';
import { DynamicInjector } from '@di/core/dynamic-injector';
import { Injector, NOT_FOUND, ProviderResolvable } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleDef, ModuleRef, ɵModuleRefImpl } from '@di/core/module-ref';
import { Reflector } from '@di/core/reflector';
import { isDynamicModule, WatsonModuleOptions } from '@di/decorators';
import { W_MODULE_PROV } from '@di/fields';
import { CustomProvider, InjectionToken, isInjectionToken, resolveForwardRef, WatsonDynamicModule } from '@di/providers';
import { Type } from '@di/types';
import { optionalAssign, resolveAsyncValue } from '@di/utils';
import { isNil } from '@di/utils/common';

export interface WatsonModuleMetadata {
  metatype: Type;
  imports: (Type | WatsonDynamicModule | Promise<WatsonDynamicModule>)[];
  exports: (Type | InjectionToken)[];
  components: Type[];
  providers: (Type | CustomProvider)[];
}

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
  public async resolveRootModule<T extends ModuleRef = ModuleRef>(
    metatype: Type
  ): Promise<T> {
    const modules = await this._scanModuleRecursively(metatype);
    return this._bindModuleProvidersAndCreateModuleRef<T>(metatype, modules);
  }

  private async _scanModuleRecursively(
    metatype: Type | WatsonDynamicModule,
    resolved = new Map<Type, ModuleDef>(),
    ctx: Type[] = []
  ): Promise<Map<Type, ModuleDef>> {
    let {
      imports,
      metatype: type,
      exports,
      providers,
      components,
    } = await this.reflectModuleMetadata(metatype);

    ctx.push(type);

    /**
     * DynamicModules can return
     * a promise so we need to make
     * sure that we await all modules
     */
    let _imports = (await Promise.all(
      imports.map(async (module) =>
        isDynamicModule(await module)
          ? (
              await (<Promise<WatsonDynamicModule>>module)
            ).module
          : module
      )
    )) as Type[];

    /**
     * Resolve all module forwardRefs so that we
     * don't have to deal with them later
     */
    [providers, components] = [providers, components].map(
      (_) => <Type[]>_.map(resolveForwardRef)
    );

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

        return this._scanModuleRecursively(module as Type, resolved);
      })
    );

    ctx.pop();

    return resolved;
  }

  private async _bindModuleProvidersAndCreateModuleRef<T extends ModuleRef>(
    rootModule: Type,
    modules: Map<Type, ModuleDef>
  ): Promise<T> {
    let container = await this._injector.get(ModuleContainer, NOT_FOUND);
    const ModuleImpl =
      Reflector.reflectMetadata<typeof ɵModuleRefImpl>(
        MODULE_REF_IMPL_METADATA,
        Injector
      ) ?? ɵModuleRefImpl;

    if (container === NOT_FOUND) {
      container = new ModuleContainer();
      (<DynamicInjector>this._injector).bind({
        provide: ModuleContainer,
        useValue: container,
      });
    }

    const rootDef = modules.get(rootModule)!;

    // Calling this method on the root module
    // should resolve injector providers for all
    // other modules as well.
    this._recursivelyResolveModuleProviders(rootDef, modules);

    const rootRef = new ModuleImpl(
      rootModule,
      this._injector,
      this._injector,
      rootDef
    );

    container.apply(rootRef);

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
    return <T>rootRef;
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
  private _recursivelyResolveModuleProviders(
    moduleDef: ModuleDef,
    modules: Map<Type, ModuleDef>
  ): ProviderResolvable[] | void {
    const { imports, providers, metatype } = moduleDef;
    const moduleProviders: ProviderResolvable[] = providers;

    if (!isNil(metatype[W_MODULE_PROV])) {
      return metatype[W_MODULE_PROV];
    }

    const resolveModuleExports = (moduleDef: ModuleDef) => {
      const { imports, exports, providers, metatype } = moduleDef;

      // Check for module re-exporting
      for (const _export of exports) {
        // If the module exports itself,
        // export all of it's providers
        if (_export === metatype) {
          moduleProviders.push(...providers);
          continue;
        }

        const moduleDef = modules.get(<Type>_export);

        if (isNil(moduleDef)) {
          const hasCustomProviderWithType = providers.find(
            (provider) => (<CustomProvider>provider)?.provide === _export
          );

          if (!isNil(hasCustomProviderWithType)) {
            moduleProviders.push(hasCustomProviderWithType);
            continue;
          }

          if (isInjectionToken(_export)) {
            throw `Could not find export ${_export.name} in ${metatype.name}`;
          }

          moduleProviders.push(_export);
          continue;
        }

        if (!imports.includes(moduleDef.metatype)) {
          throw `ModuleLoader: Could not find an import for the exported module ${moduleDef.metatype.name}`;
        }

        resolveModuleExports(moduleDef);
      }
    };

    for (const _import of imports) {
      const importDef = modules.get(_import);

      if (isNil(importDef)) {
        throw `ModuleLoader: Could not find module definition for module ${_import.name}`;
      }

      resolveModuleExports(importDef);
      this._recursivelyResolveModuleProviders(importDef, modules);
    }

    optionalAssign(metatype, W_MODULE_PROV, moduleProviders);
    return moduleProviders;
  }

  public async reflectModuleMetadata(
    target: Type | WatsonDynamicModule | Promise<WatsonDynamicModule>
  ): Promise<WatsonModuleMetadata> {
    if (isDynamicModule((await target) as WatsonDynamicModule)) {
      return this._getDataFromDynamicModule(<WatsonDynamicModule>target);
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

  private async _getDataFromDynamicModule(
    dynamicModule: WatsonDynamicModule | Type
  ): Promise<WatsonModuleMetadata> {
    const dynamicModuleDef = await resolveAsyncValue(dynamicModule);

    if (isNil(dynamicModuleDef)) {
      throw `The dynamic module ${
        (<Type>dynamicModule).name
      } did not return module metadata.`;
    }

    const { module, components, imports, providers, exports } =
      dynamicModuleDef as WatsonDynamicModule;

    return {
      metatype: module,
      imports: imports ?? [],
      exports: exports ?? [],
      providers: providers ?? [],
      components: components ?? [],
    };
  }
}
