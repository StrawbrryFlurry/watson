import { Binding, InjectorGetResult } from '@di';
import { DIProvided, Providable, ReceiverDef, Type, UniqueTypeArray } from '@watsonjs/common';

import { ProviderResolvable } from '..';
import { ComponentFactory } from './component-factory';
import { Injector } from './injector';

export abstract class ModuleRef
  extends DIProvided({ providedIn: "module" })
  implements Injector
{
  public parent: Injector | null;
  public metatype: Type;

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): Promise<R>;

  public abstract get injector(): Injector;
}

export interface ModuleDef {
  imports: ProviderResolvable[];
  receivers: Type[];
  providers: ProviderResolvable[];
  exports: ProviderResolvable | ModuleDef[];
}

/**
 * Wrapper for a class decorated with the @\Module decorator.
 */
export class ModuleImpl extends ModuleRef implements Injector {
  private readonly _parent: Injector;

  public readonly exports = new UniqueTypeArray<ProviderResolvable>();
  public readonly imports = new UniqueTypeArray<ModuleRef>();
  public readonly receivers = new UniqueTypeArray<ReceiverDef>();
  public readonly providers = new UniqueTypeArray<ProviderResolvable>();

  private readonly __injectorProviders = new UniqueTypeArray<Binding>();

  private _componentFactory: ComponentFactory;

  public _injector: Injector;

  public get injector(): Injector {
    return this._injector;
  }

  constructor(metatype: Type, moduleDef: ModuleDef, parent: Injector) {
    super();
    this.metatype = metatype;
    const { exports, imports, providers, receivers } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.receivers.add(...receivers);
    this.providers.add(...providers);

    this._injector = Injector.create([], parent, this);
    this._componentFactory = new ComponentFactory(this);
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
