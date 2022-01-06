import { AbstractInjectableFactory, AbstractInjectableFactoryResolver } from '@di/core/abstract-factory';
import { ComponentFactory } from '@di/core/component-factory';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime } from '@di/providers/injection-token';
import { Constructable, isType, Type } from '@di/types';
import { stringify } from '@di/utils';
import { isNil } from '@di/utils/common';

import type { ComponentRef } from "@di/core/component-ref";
import type { ModuleRef } from "@di/core/module-ref";

/**
 * The `ComponentFactoryResolver` of a module can be used
 * to create a factory to create component instances of
 * any component in that module without being dependent
 * on having the original `ModuleRef`.
 */
@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class ComponentFactoryResolver extends AbstractInjectableFactoryResolver<ComponentFactory> {}

class NullComponentFactoryResolver extends ComponentFactoryResolver {
  public resolve<
    T extends Type<any>,
    R extends T extends Constructable<infer R> ? R : T
  >(
    component: T,
    moduleRef?: ModuleRef<any>
  ): Promise<AbstractInjectableFactory<R>> {
    throw `[NullComponentFactoryError] Could not find any provider for component ${stringify(
      component
    )}`;
  }
}

export class ComponentFactoryResolverImpl extends ComponentFactoryResolver {
  public parent: ComponentFactoryResolver;

  constructor(moduleRef: ModuleRef) {
    super(moduleRef);
    const { componentFactoryResolver } = <ModuleRef>moduleRef.parent ?? {};
    this.parent =
      componentFactoryResolver ?? new NullComponentFactoryResolver(moduleRef);
  }

  public async resolve<T extends Type>(
    component: T,
    moduleRef?: ModuleRef<any>
  ): Promise<ComponentFactory<T>> {
    if (!isType(component)) {
      throw `Cannot create component instance of ${stringify(
        component
      )} as it is not a constructor`;
    }

    const record = this._records.get(component);

    if (!isNil(record)) {
      return <ComponentFactory<T>>record;
    }

    if (!this._isComponentInModule(component, moduleRef)) {
      return this.parent.resolve(component);
    }

    const _moduleRef = moduleRef ?? <ModuleRef>this._injector;
    const componentRef = await _moduleRef.get<ComponentRef>(component);
    const factory = new ComponentFactory<T>(component, componentRef);

    this._records.set(component, factory);
    return factory;
  }

  private _isComponentInModule<T extends Type>(
    component: T,
    moduleRef?: ModuleRef
  ): boolean {
    const _moduleRef = moduleRef ?? <ModuleRef>this._injector;
    const { components } = _moduleRef;
    return components.has(component);
  }
}
