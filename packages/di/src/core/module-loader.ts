import { MODULE_DEFINITION_METADATA, MODULE_REF_IMPL_METADATA } from '@di/constants';
import { DynamicInjector } from '@di/core/dynamic-injector';
import { Injector, NOT_FOUND, ProviderResolvable } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleDef, ModuleRef, ROOT_MODULE_REF, ɵModuleRefImpl } from '@di/core/module-ref';
import { Reflector } from '@di/core/reflector';
import { UniqueTypeArray } from '@di/data-structures';
import { Injectable } from '@di/decorators/injectable.decorator';
import { isDynamicModule, WatsonModuleOptions } from '@di/decorators/module.decorator';
import { W_GLOBAL_PROV, W_MODULE_PROV } from '@di/fields';
import { CustomProvider, ValueProvider } from '@di/providers/custom-provider.interface';
import { WatsonDynamicModule } from '@di/providers/dynamic-module.interface';
import { resolveForwardRef } from '@di/providers/forward-ref';
import { InjectionToken, isInjectionToken } from '@di/providers/injection-token';
import { Type } from '@di/types';
import { optionalAssign, resolveAsyncValue, stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

export interface WatsonModuleMetadata {
  metatype: Type;
  imports: (Type | WatsonDynamicModule | Promise<WatsonDynamicModule>)[];
  exports: (Type | InjectionToken)[];
  components: Type[];
  providers: (Type | CustomProvider)[];
}

/**
 * Responsible for resolving all module metadata
 * belonging to the "application"-module specified when
 * calling `resolveRootModule` and its' imports.
 */
export class ModuleLoader {
  private _injector: Injector;

  constructor(injector: Injector) {
    this._injector = injector;
  }

  /**
   * Recursively looks through all imports of
   * `moduleType`, resolving it's definition and
   * creating a `ModuleRef` instance for every one
   * of them. All modules are added to the `ModuleContainer`
   * in the root injector of the `ModuleLoader`.
   *
   * Returns the `ModuleRef` of the root module.
   */
  public async resolveRootModule<T extends ModuleRef = ModuleRef>(
    moduleType: Type
  ): Promise<T> {
    const modules = await this._scanModuleRecursively(moduleType);
    return this._bindModuleProvidersAndCreateModuleRef<T>(moduleType, modules);
  }

  /**
   * Scans the module type or dynamic module
   * for it's metadata and adds it to the
   * `resolved` map.
   */
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
     * Dynamic modules can return
     * a promise so we need to make
     * sure that we await all module
     * types.
     */
    let _imports = (await Promise.all(
      imports.map(async (module) => {
        const typeOrDynamicModule = await module;
        return isDynamicModule(typeOrDynamicModule)
          ? typeOrDynamicModule.module
          : typeOrDynamicModule;
      })
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

    // Repeat this for all module imports
    await Promise.all(
      // We have already awaited the dynamic modules
      (imports as (Type | WatsonDynamicModule)[]).map((module) => {
        const importType = isDynamicModule(module) ? module.module : module;

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

  /**
   * Creates an instance of `ModuleRef` for all
   * previously found modules.
   */
  private async _bindModuleProvidersAndCreateModuleRef<T extends ModuleRef>(
    rootModule: Type,
    modules: Map<Type, ModuleDef>
  ): Promise<T> {
    let container = await this._injector.get(ModuleContainer, NOT_FOUND);
    /**
     * We allow users to provide their own Module implementation
     * using `@DeclareModuleRef`. Use the default `ModuleRef`
     * if there is none.
     */
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

    /*
     * Calling this method on the root module
     * should resolve injector providers for all
     * other modules as well.
     */
    this._recursivelyResolveModuleProviders(rootDef, modules);

    const rootRef = new ModuleImpl(
      rootModule,
      this._injector,
      this._injector,
      rootDef
    );

    /**
     * When a provider is registered using
     * `@Injectable` and providedIn is root
     * that type is added to this array.
     * Doing this will allow users to register
     * global providers without having to provide
     * them in any module.
     */
    const providedInRootByInjectableDecorator = Injectable[
      W_GLOBAL_PROV
    ] as UniqueTypeArray<Type>;

    const rootModuleProviders = [
      ...providedInRootByInjectableDecorator,
      <ValueProvider>{
        provide: ROOT_MODULE_REF,
        useValue: rootRef,
      },
    ];
    (<DynamicInjector>rootRef.injector).bind(...rootModuleProviders);

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

    // If this property exists we have already
    // processed the module.
    if (!isNil(metatype[W_MODULE_PROV])) {
      return metatype[W_MODULE_PROV];
    }

    // Add all exported providers of the module to
    // this module's providers recursively.
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
          const getCustomProviderByType = (
            providers: CustomProvider[],
            type: InjectionToken
          ) => providers.find((provider) => provider?.provide === type);

          const hasCustomProviderWithType = getCustomProviderByType(
            <CustomProvider[]>providers,
            <InjectionToken>_export
          );

          if (!isNil(hasCustomProviderWithType)) {
            moduleProviders.push(hasCustomProviderWithType);
            continue;
          }

          if (!isInjectionToken(_export)) {
            moduleProviders.push(_export);
            continue;
          }

          /**
           * Check nested import exports.
           *
           * Module M has provider Foo
           *
           * A imports M exports M
           * B imports A exports A
           * C imports B
           *
           * C needs to find the provider Foo
           */
          const checkNestedImportExports = (__imports: Type[]) => {
            for (const __import of __imports) {
              const {
                exports,
                providers,
                imports: ___imports,
              } = modules.get(__import)!;
              const doesExportItselfOrProvider = exports.find(
                (__export) => __export === _export || __export === __import
              );

              if (doesExportItselfOrProvider) {
                const provider = getCustomProviderByType(
                  <CustomProvider[]>providers,
                  _export
                );

                if (provider) {
                  return provider;
                }
              }

              checkNestedImportExports(___imports);
            }
          };

          const exportInImport = checkNestedImportExports(imports);

          if (!isNil(exportInImport)) {
            moduleProviders.push(exportInImport);
            continue;
          }

          throw `ModuleLoader: Could not find an import for the exported provider ${_export.name} in ${metatype.name}`;
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

    const moduleMetadata = Reflector.reflectMetadata<WatsonModuleOptions>(
      MODULE_DEFINITION_METADATA,
      <Type>target
    );

    if (isNil(moduleMetadata)) {
      throw `Could not find any module definition for ${stringify(
        target
      )}. Did you mean to import it as a DynamicModule?`;
    }

    const { components, exports, imports, providers } = moduleMetadata;

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
