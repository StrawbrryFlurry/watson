import { Binding, createBinding, findMostTransientDependencyLifetime } from '@di/core/binding';
import { ɵcreateBindingInstance } from '@di/core/dynamic-injector';
import { Injector } from '@di/core/injector';
import { InjectorInquirerContext } from '@di/core/inquirer-context';
import { Reflector } from '@di/core/reflector';
import { Injectable } from '@di/decorators';
import { InjectorLifetime, ɵdefineInjectable } from '@di/providers';
import { Type } from '@di/types';
import { stringify } from '@di/utils';

@Injectable({ providedIn: "component", lifetime: InjectorLifetime.Module })
export abstract class ComponentFactoryRef<T extends Type = Type> {
  public type: T;
  public bindingRef: Binding<T, any, T>;
  public abstract create(
  /** The injector that should be used in place of the injector defined in the factory */
    injector?: Injector | null,
    ctx?: Injector
  ): Promise<T>;
}

export class ComponentFactory<
  T extends Type = Type
> extends ComponentFactoryRef<T> {
  private _injector: Injector;

  constructor(component: T, injector: Injector) {
    super();
    this.type = component;
    this._injector = injector;
    const componentDeps = Reflector.reflectCtorArgs(component);
    let lifetime = findMostTransientDependencyLifetime(componentDeps);

    if (lifetime & InjectorLifetime.Singleton) {
      lifetime = InjectorLifetime.Module;
    }

    ɵdefineInjectable(component, { providedIn: "module", lifetime });
    this.bindingRef = createBinding(component);
  }

  public async create(
    /** The injector that should be used in place of the injector defined in the factory */
    injector?: Injector | null,
    ctx?: Injector
  ): Promise<T> {
    const inj = injector ?? this._injector;

    return ɵcreateBindingInstance(
      this.bindingRef,
      inj,
      ctx ?? null,
      new InjectorInquirerContext(ComponentFactory)
    );
  }

  public toString() {
    return `ComponentFactory<${stringify(this.type)}>`;
  }
}
