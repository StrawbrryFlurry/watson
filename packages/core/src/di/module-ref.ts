import { DynamicInjector, getInjectableDef, InjectorGetResult, Reflector } from '@core/di';
import {
  CustomProvider,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  Injectable,
  IsInterceptor,
  isNil,
  PIPE_METADATA,
  PREFIX_METADATA,
  Providable,
  ROUTER_METADATA,
  RouterDecoratorOptions,
  Type,
  UniqueTypeArray,
  ValueProvider,
  W_INT_TYPE,
  W_MODULE_PROV,
} from '@watsonjs/common';

import { ProviderResolvable, RouterRefImpl } from '..';
import { ComponentFactory } from './component-factory';
import { Injector } from './injector';

/**
 * `ModuleRef` is a wrapper for a Watson Module which
 * contains that module's injector and the component
 * factory used to create routers and other parts
 * of the module.
 */
@Injectable({ providedIn: "module" })
export abstract class ModuleRef<T = any> implements Injector {
  public parent: Injector | null;
  public metatype: Type;

  public instance: T | null = null;

  public get name() {
    return this.metatype.name;
  }

  public readonly exports = new UniqueTypeArray<ProviderResolvable>();
  public readonly imports = new UniqueTypeArray<Type>();
  public readonly routers = new UniqueTypeArray<Type>();
  public readonly providers = new UniqueTypeArray<ProviderResolvable>();

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R>;

  public abstract get injector(): Injector;

  public async getInstance(): Promise<T> {
    if (!isNil(this.instance)) {
      return this.instance;
    }

    return this.injector.get(this.metatype);
  }
}

export interface ModuleDef {
  metatype: Type;
  imports: Type[];
  routers: Type[];
  providers: ProviderResolvable[];
  exports: ProviderResolvable[];
}

export class ModuleImpl extends ModuleRef implements Injector {
  public componentFactory: ComponentFactory;

  public get injector(): Injector {
    return this._injector as Injector;
  }
  private _injector: Injector;

  private _contextProviders = new UniqueTypeArray<ProviderResolvable>();

  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super();
    this.metatype = metatype;
    this.parent = parent;

    const { exports, imports, providers, routers } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.routers.add(...routers);
    this.providers.add(...providers);

    const injectorProviders = metatype[W_MODULE_PROV] as ProviderResolvable[];
    const moduleScopedInjectables = new UniqueTypeArray<IsInterceptor>();
    const moduleInjectorProviders = this._bindProviders(
      injectorProviders,
      moduleScopedInjectables,
      rootInjector
    );

    const routerBindableProviders = this._bindRouters(
      routers,
      moduleScopedInjectables
    );

    const injectorBindableProviders = [
      ...moduleInjectorProviders,
      ...routerBindableProviders,
    ];

    this._injector = Injector.create(injectorBindableProviders, parent, this);
    this.componentFactory = new ComponentFactory();
  }

  private _bindProviders(
    providers: ProviderResolvable[],
    routerInjectables: IsInterceptor[],
    rootInjector: Injector
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getInjectableDef(provider);

        if (!isNil(provider[W_INT_TYPE])) {
          routerInjectables.push(provider as any as IsInterceptor);
          return false;
        }

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
   * that resolve to the {@link RouterRef} of
   * all the routers in the module.
   */
  private _bindRouters(
    routers: Type[],
    moduleScopedComponentInjectables: IsInterceptor[]
  ): CustomProvider[] {
    return routers.map((router) => {
      const componentScopedInjectables =
        this._reflectAllComponentInjectables(router);

      const componentProviders = this._reflectComponentProviders(router);

      const componentInjectables: IsInterceptor[] = [
        ...moduleScopedComponentInjectables,
        ...componentScopedInjectables,
      ];

      const routerRef = new RouterRefImpl(
        router,
        componentProviders,
        componentInjectables,
        this
      );

      return {
        provide: router,
        useValue: routerRef,
        multi: false,
      } as ValueProvider;
    });
  }

  private _reflectAllComponentInjectables(metatype: Type) {
    const injectables = new UniqueTypeArray<IsInterceptor>();

    if (isNil(metatype) || isNil(metatype.prototype)) {
      return injectables;
    }

    this._reflectComponentInjectable(metatype, injectables, GUARD_METADATA);
    this._reflectComponentInjectable(metatype, injectables, PIPE_METADATA);
    this._reflectComponentInjectable(metatype, injectables, FILTER_METADATA);
    this._reflectComponentInjectable(
      metatype,
      injectables,
      EXCEPTION_HANDLER_METADATA
    );
    this._reflectComponentInjectable(metatype, injectables, PREFIX_METADATA);

    return injectables;
  }

  private _reflectComponentInjectable(
    metatype: Type,
    ctx: UniqueTypeArray<IsInterceptor>,
    metadataKey: string
  ) {
    const prototypeInjectables =
      Reflector.reflectMetadata<any[]>(metadataKey, metatype) ?? [];

    const prototypeMethods = Reflector.reflectMethodsOfType(metatype);

    const methodInjectables = prototypeMethods
      .map(
        (method) =>
          Reflector.reflectMetadata<any[]>(metadataKey, method.descriptor) ?? []
      )
      .filter((e) => !isNil(e));

    const injectables = [...prototypeInjectables, ...methodInjectables.flat()];

    ctx.add(...injectables);
  }

  private _reflectComponentProviders(metatype: Type): ProviderResolvable[] {
    const { providers } = Reflector.reflectMetadata<RouterDecoratorOptions>(
      ROUTER_METADATA,
      metatype
    );

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
