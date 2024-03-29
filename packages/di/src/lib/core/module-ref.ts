import { COMPONENT_METADATA } from '@di/constants';
import { ComponentFactoryResolver, ComponentFactoryResolverImpl } from '@di/core/component-factory-resolver';
import { ɵComponentRefImpl } from '@di/core/component-ref';
import { DynamicInjector } from '@di/core/dynamic-injector';
import { Injector, ProviderResolvable } from '@di/core/injector';
import { ProviderFactoryResolver, ProviderFactoryResolverImpl } from '@di/core/provider-factory-resolver';
import { Reflector } from '@di/core/reflector';
import { UniqueTypeArray } from '@di/data-structures';
import { ComponentDecoratorOptions } from '@di/decorators/component.decorator';
import { Injectable } from '@di/decorators/injectable.decorator';
import { W_MODULE_PROV } from '@di/fields';
import { CustomProvider, ValueProvider } from '@di/providers/custom-provider.interface';
import { getInjectableDef } from '@di/providers/injectable-def';
import { InjectionToken, InjectorLifetime, Providable, ɵdefineInjectable } from '@di/providers/injection-token';
import { Type } from '@di/types';

export interface ModuleDef {
  metatype: Type;
  imports: Type[];
  components: Type[];
  providers: ProviderResolvable[];
  exports: (ProviderResolvable | InjectionToken)[];
}

/**
 * An `InjectionToken` provided in the "root"
 * or "application" module with which
 * `ModuleLoader.resolveRootModule` was called.
 */
export const ROOT_MODULE_REF = new InjectionToken<ModuleRef>(
  "The root module of the application"
);

/**
 * `ModuleRef` is a wrapper for a module which
 * contains that module's injector as well as all
 * components and providers that were mapped to it.
 */
@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class ModuleRef<
  T extends object = Type,
  M extends Type<T> = Type<T>
> implements Injector
{
  public parent: ModuleRef | Injector | null;
  public metatype: M;

  public componentFactoryResolver: ComponentFactoryResolver =
    new ComponentFactoryResolverImpl(this);

  public get name() {
    return this.metatype.name;
  }

  public get injector(): Injector {
    return this._injector as Injector;
  }
  private _injector: Injector;

  public readonly exports = new UniqueTypeArray<
    ProviderResolvable | InjectionToken
  >();
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
    metatype: M,
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
      ...this._makeModuleProviders(),
    ];

    this._injector = Injector.create(injectorProviders, parent, this);
  }

  private _makeModuleProviders(): CustomProvider[] {
    return [
      {
        provide: ComponentFactoryResolver,
        useValue: this.componentFactoryResolver,
      },
      {
        provide: ProviderFactoryResolver,
        // We use a factory function cause not every module
        // needs a `ProviderFactoryResolver`.
        useFactory: () => new ProviderFactoryResolverImpl(this),
      },
    ];
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
   * that resolve to the {@link ComponentRef} of
   * all components in this module.
   */
  protected _bindComponents(
    components: Type[],
    ComponentRefImpl: typeof ɵComponentRefImpl
  ): CustomProvider[] {
    return components.map((component) => {
      const componentProviders = this._reflectComponentProviders(component);
      /**
       * The lifetime of any type is Singleton by default
       * which would make us share instances of the component
       * binding whenever we create a new one. `ComponentRef`
       * provides this type again which would then reuse this
       * binding for `ComponentRef` instead of the component
       * instance.
       */
      ɵdefineInjectable(component, { lifetime: InjectorLifetime.Scoped });

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
   * Creates an instance of a component
   * that is part of this module.
   */
  public async createComponent<T extends Type = Type>(
    component: T,
    ctx?: Injector
  ) {
    const compFactory = await this.componentFactoryResolver.resolve(component);
    return compFactory.create(null, ctx);
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
