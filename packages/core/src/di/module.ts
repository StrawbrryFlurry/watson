import { DynamicInjector, getProviderScope, InjectorGetResult, Reflector } from '@core/di';
import {
  CustomProvider,
  DIProvided,
  EXCEPTION_HANDLER_METADATA,
  FILTER_METADATA,
  GUARD_METADATA,
  isNil,
  PIPE_METADATA,
  PREFIX_METADATA,
  Providable,
  RECEIVER_METADATA,
  ReceiverDef,
  ReceiverOptions,
  Type,
  UniqueTypeArray,
  ValueProvider,
  W_INJ_TYPE,
  W_MODULE_PROV,
} from '@watsonjs/common';
import { IsInjectable } from 'packages/common/src/decorators/interceptors/is-injectable';

import { ProviderResolvable } from '..';
import { ComponentFactory } from './component-factory';
import { Injector } from './injector';
import { ReceiverRef } from './receiver-ref';

/**
 * `ModuleRef` is a wrapper for a Watson Module which
 * contains that module's injector and the component
 * factory used to create receivers and other parts
 * of the module.
 */
export abstract class ModuleRef<T = any>
  extends DIProvided({ providedIn: "module" })
  implements Injector
{
  public parent: Injector | null;
  public metatype: Type;

  public instance: T | null = null;

  public get name() {
    return this.metatype.name;
  }

  public readonly exports = new UniqueTypeArray<ProviderResolvable>();
  public readonly imports = new UniqueTypeArray<Type>();
  public readonly receivers = new UniqueTypeArray<ReceiverDef>();
  public readonly providers = new UniqueTypeArray<ProviderResolvable>();

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any
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
  receivers: Type[];
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

    const { exports, imports, providers, receivers } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.receivers.add(...receivers);
    this.providers.add(...providers);

    const injectorProviders = metatype[W_MODULE_PROV] as ProviderResolvable[];
    const moduleScopedInjectables = new UniqueTypeArray<IsInjectable>();
    const moduleInjectorProviders = this._bindProviders(
      injectorProviders,
      moduleScopedInjectables,
      rootInjector
    );

    const receiverBindableProviders = this._bindReceivers(
      receivers,
      moduleScopedInjectables
    );

    const injectorBindableProviders = [
      ...moduleInjectorProviders,
      ...receiverBindableProviders,
    ];

    this._injector = Injector.create(injectorBindableProviders, parent, this);
    this._componentFactory = new ComponentFactory();
  }

  private _bindProviders(
    providers: ProviderResolvable[],
    receiverInjectables: IsInjectable[],
    rootInjector: Injector
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getProviderScope(provider);

        if (!isNil(provider[W_INJ_TYPE])) {
          receiverInjectables.push(provider as any as IsInjectable);
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
   * that resolve to the {@link ReceiverRef} of
   * all the receivers in the module.
   */
  private _bindReceivers(
    receivers: Type[],
    moduleScopedComponentInjectables: IsInjectable[]
  ): CustomProvider[] {
    return receivers.map((receiver) => {
      const componentScopedInjectables =
        this._reflectAllComponentInjectables(receiver);

      const componentProviders = this._reflectComponentProviders(receiver);

      const componentInjectables: IsInjectable[] = [
        ...moduleScopedComponentInjectables,
        ...componentScopedInjectables,
      ];

      const receiverRef = new ReceiverRef(
        receiver,
        componentProviders,
        componentInjectables,
        this
      );

      return {
        provide: receiver,
        useValue: receiverRef,
        multi: false,
      } as ValueProvider;
    });
  }

  private _reflectAllComponentInjectables(metatype: Type) {
    const injectables = new UniqueTypeArray<IsInjectable>();

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
    ctx: UniqueTypeArray<IsInjectable>,
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
    const { providers } = Reflector.reflectMetadata<ReceiverOptions>(
      RECEIVER_METADATA,
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
