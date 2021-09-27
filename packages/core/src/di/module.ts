import { Binding } from '@di';
import { InjectorElementId, Providable, ReceiverDef, Type, UniqueTypeArray, WATSON_ELEMENT_ID } from '@watsonjs/common';

import { ProviderResolvable } from '..';
import { Injector } from './injector';

export abstract class ModuleRef implements Injector {
  public parent: Injector | null;
  public metatype: Type;
  public abstract get<T>(typeOrToken: Providable<T>): T;

  public abstract get injector(): Injector;

  static [WATSON_ELEMENT_ID] = InjectorElementId.Injector;
}

export interface ModuleDef {
  imports: Binding[];
  receivers: Type[];
  providers: Binding[];
  exports: Binding[];
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

  public _injector: Injector;

  public get injector(): Injector {
    return this._injector;
  }

  constructor(metatype: Type, moduleDef: ModuleDef) {
    super();
    this.metatype = metatype;
    const { exports, imports, providers, receivers } = moduleDef;

    this.exports.add(...exports);
    this.imports.add(...imports);
    this.receivers.add(...receivers);
    this.providers.add(...providers);

    this._injector = Injector.create([], this);
  }

  public get<T>(typeOrToken: Providable<T>): T {
    return this.injector.get(typeOrToken);
  }
}
