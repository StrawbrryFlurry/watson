import { ComponentFactory } from '@di/core/component-factory';
import { WatsonComponentRef } from '@di/core/component-ref';
import { ModuleRef } from '@di/core/module-ref';
import { Injectable } from '@di/decorators';
import { InjectorLifetime } from '@di/providers';
import { Constructable, isType, Type } from '@di/types';
import { stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Module })
export abstract class ComponentFactoryResolver {
  public parent: ComponentFactoryResolver;
  protected _records = new WeakMap<Type, ComponentFactory>();
  protected _moduleRef: ModuleRef;

  abstract resolve<
    T extends Type,
    C extends T extends Constructable<infer C> ? C : T
  >(component: T, moduleRef?: ModuleRef): Promise<ComponentFactory<C>>;
}

class NullComponentFactoryResolver extends ComponentFactoryResolver {
  public resolve<
    T extends Type,
    C extends T extends Constructable<infer C> ? C : T
  >(component: T): Promise<ComponentFactory<C>> {
    throw `[NullComponentFactoryError] Could not find any provider for component ${stringify(
      component
    )}`;
  }
}

export class ComponentFactoryResolverImpl extends ComponentFactoryResolver {
  constructor(moduleRef: ModuleRef) {
    super();
    this._moduleRef = moduleRef;
    const { componentFactoryResolver } = <ModuleRef>moduleRef.parent ?? {};
    this.parent =
      componentFactoryResolver ?? new NullComponentFactoryResolver();
  }

  public async resolve<
    T extends Type,
    C extends T extends Constructable<infer C> ? C : T
  >(component: T, moduleRef?: ModuleRef): Promise<ComponentFactory<C>> {
    if (!isType(component)) {
      throw `Cannot create component instance of ${stringify(
        component
      )} as it is not a constructor`;
    }

    const record = this._records.get(component);

    if (!isNil(record)) {
      return <ComponentFactory<C>>record;
    }

    if (!this._isComponentInModule(component, moduleRef)) {
      return this.parent.resolve(component);
    }

    const _moduleRef = moduleRef ?? this._moduleRef;
    const componentRef = await _moduleRef.get<WatsonComponentRef>(component);
    const factory = new ComponentFactory<C>(<C>component, componentRef);

    this._records.set(component, factory);
    return factory;
  }

  private _isComponentInModule<T extends Type>(
    component: T,
    moduleRef?: ModuleRef
  ): boolean {
    const _moduleRef = moduleRef ?? this._moduleRef;
    const { components } = _moduleRef;
    return components.has(component);
  }
}
