import { Binding, createBinding, DynamicInjector, getProviderScope, InjectorGetResult } from '@di';
import { DIProvided, isNil, Providable, ReceiverDef, Type, UniqueTypeArray, WATSON_MODULE_PROV } from '@watsonjs/common';

import { ProviderResolvable } from '..';
import { ComponentFactory } from './component-factory';
import { Injector } from './injector';

export abstract class ModuleRef<T = any>
  extends DIProvided({ providedIn: "module" })
  implements Injector
{
  public parent: Injector | null;
  public metatype: Type;

  public instance: T | null;

  public readonly exports = new UniqueTypeArray<ProviderResolvable>();
  public readonly imports = new UniqueTypeArray<Type>();
  public readonly receivers = new UniqueTypeArray<ReceiverDef>();
  public readonly providers = new UniqueTypeArray<ProviderResolvable>();

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
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

/**
 * Wrapper for a class decorated with the @\Module decorator.
 */
export class ModuleImpl extends ModuleRef implements Injector {
  public componentFactory: ComponentFactory;

  public get injector(): Injector {
    return this.parent as Injector;
  }

  private _contextProviders = new UniqueTypeArray<Binding>();

  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super();
    this.metatype = metatype;
    const { exports, imports, providers, receivers } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.receivers.add(...receivers);
    this.providers.add(...providers);

    const injectorProviders = metatype[
      WATSON_MODULE_PROV
    ] as ProviderResolvable[];

    const injectorBindableProviders = this._bindProviders(
      injectorProviders,
      rootInjector
    );

    this.parent = Injector.create(injectorBindableProviders, parent, this);
    this._componentFactory = new ComponentFactory(this);
  }

  private _bindProviders(
    providers: ProviderResolvable[],
    rootInjector: Injector
  ): ProviderResolvable[] {
    return providers
      .map((provider) => {
        const { providedIn } = getProviderScope(provider);

        if (providedIn === "root") {
          (rootInjector as DynamicInjector).bind(provider);
        } else if (providedIn === "ctx") {
          this._contextProviders.add(createBinding(provider));
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
   * We could implement the moduleRef
   * as the injector itself
   * but I'd like to keep their
   * implementation separate to make
   * it more manageable
   */
  public async get<T>(typeOrToken: Providable<T>): Promise<T> {
    return this.injector.get(typeOrToken);
  }
}
