import { COMPONENT_METADATA } from '@di/constants';
import { getInjectableDef } from '@di/core/binding';
import { ɵComponentRefImpl } from '@di/core/component-ref';
import { DynamicInjector } from '@di/core/dynamic-injector';
import { Injector, ProviderResolvable } from '@di/core/injector';
import { Reflector } from '@di/core/reflector';
import { UniqueTypeArray } from '@di/data-structures';
import { ComponentDecoratorOptions, Injectable } from '@di/decorators';
import { W_MODULE_PROV } from '@di/fields';
import { CustomProvider, Providable, ValueProvider } from '@di/providers';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

export interface ModuleDef {
  metatype: Type;
  imports: Type[];
  components: Type[];
  providers: ProviderResolvable[];
  exports: ProviderResolvable[];
}

/**
 * `ModuleRef` is a wrapper for a Watson Module which
 * contains that module's injector as well as all
 * components and providers that were mapped to it.
 */
@Injectable({ providedIn: "module" })
export abstract class ModuleRef<T = any> implements Injector {
  public parent: Injector | null;
  public metatype: Type;

  public instance: T | null = null;

  public get name() {
    return this.metatype.name;
  }

  public get injector(): Injector {
    return this._injector as Injector;
  }
  private _injector: Injector;

  public readonly exports = new UniqueTypeArray<ProviderResolvable>();
  public readonly imports = new UniqueTypeArray<Type>();
  /**
   * Components are the main DI consumer type of application.
   * In Watson, components are routers, in NestJs components
   * would be controllers and in Angular components are just..
   * well.. components.
   */
  public readonly components = new UniqueTypeArray<Type>();
  public readonly providers = new UniqueTypeArray<ProviderResolvable>();

  protected readonly _contextProviders =
    new UniqueTypeArray<ProviderResolvable>();

  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef,
    /**
     * Provide the component definition that is used in your
     * application. The default for watson is `RouterRefImpl`
     */
    ComponentRefImpl: typeof ɵComponentRefImpl | null = null
  ) {
    this.metatype = metatype;
    this.parent = parent;

    const { exports, imports, providers, components } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.components.add(...components);
    this.providers.add(...providers);

    const moduleProviders = <ProviderResolvable[]>metatype[W_MODULE_PROV] ?? [];
    const moduleInjectorProviders = this._bindProviders(
      moduleProviders,
      rootInjector
    );

    const moduleComponentProviders = this._bindComponents(
      this.components,
      ComponentRefImpl!
    );

    const injectorProviders = [
      ...moduleComponentProviders,
      ...moduleInjectorProviders,
    ];

    this._injector = Injector.create(injectorProviders, parent, metatype);
  }

  public async getInstance(): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    return this.injector.get(this.metatype);
  }

  protected _bindProviders(
    providers: ProviderResolvable[],
    rootInjector: Injector
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getInjectableDef(provider);

        if (providedIn === "root") {
          (rootInjector as DynamicInjector).bind(provider);
        } else if (providedIn === "ctx") {
          this._contextProviders.add(provider);
        } else if (providedIn === "module") {
          return provider;
        }
        // TODO: Add internal / external
        else if (providedIn === this.metatype) {
          return provider;
        }

        return false;
      })
      .filter(Boolean) as ProviderResolvable[];
  }

  /**
   * Returns an array of custom providers
   * that resolve to the {@link WatsonComponentRef} of
   * all the components in the module.
   */
  protected _bindComponents(
    components: Type[],
    ComponentRefImpl: typeof ɵComponentRefImpl
  ): CustomProvider[] {
    return components.map((component) => {
      const componentProviders = this._reflectComponentProviders(component);
      const componentRef = new ComponentRefImpl(
        component,
        componentProviders,
        this
      );

      return <ValueProvider>{
        provide: component,
        useValue: componentRef,
        multi: false,
      };
    });
  }

  protected _reflectComponentProviders(metatype: Type): ProviderResolvable[] {
    const { providers } =
      Reflector.reflectMetadata<ComponentDecoratorOptions>(
        COMPONENT_METADATA,
        metatype
      ) ?? {};

    const prov = providers ?? [];
    return [...prov, ...this._contextProviders];
  }

  /**
   * We could implement the moduleRef
   * as the injector itself
   * but I'd like to keep their
   * implementation separate to make
   * it more manageable
   */
  public async get<T>(
    typeOrToken: Providable<T>,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<T> {
    return this.injector.get(typeOrToken, notFoundValue, ctx);
  }
}

export class ɵModuleRefImpl extends ModuleRef {
  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super(metatype, rootInjector, parent, moduleDef, ɵComponentRefImpl);
  }
}
