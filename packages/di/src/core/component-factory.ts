import { AbstractInjectableFactory } from '@di/core/abstract-factory';
import { createBinding, findMostTransientDependencyLifetime } from '@di/core/binding';
import { Injector } from '@di/core/injector';
import { Reflector } from '@di/core/reflector';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime, ɵdefineInjectable } from '@di/providers/injection-token';
import { Type } from '@di/types';
import { stringify } from '@di/utils';

@Injectable({ providedIn: "component", lifetime: InjectorLifetime.Scoped })
export abstract class ComponentFactoryRef<
  T extends Type
> extends AbstractInjectableFactory<T> {}

export class ComponentFactory<
  T extends Type = Type
> extends ComponentFactoryRef<T> {
  constructor(component: T, injector: Injector) {
    super(component, injector);
    const componentDeps = Reflector.reflectCtorArgs(component);
    let lifetime = findMostTransientDependencyLifetime(componentDeps);

    if (lifetime & InjectorLifetime.Singleton) {
      lifetime = InjectorLifetime.Scoped;
    }

    ɵdefineInjectable(component, { providedIn: "module", lifetime });
    this.bindingRef = createBinding(component);
  }

  public toString() {
    return `ComponentFactory<${stringify(this.type)}>`;
  }
}
