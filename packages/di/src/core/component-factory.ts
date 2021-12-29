import { AbstractInjectableFactory } from '@di/core/abstract-factory';
import { createBinding, findMostTransientDependencyLifetime } from '@di/core/binding';
import { Injector } from '@di/core/injector';
import { InjectorInquirerContext } from '@di/core/inquirer-context';
import { Reflector } from '@di/core/reflector';
import { ɵcreateBindingInstance } from '@di/core/ɵinjector';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime, ɵdefineInjectable } from '@di/providers/injection-token';
import { Constructable, Type } from '@di/types';
import { getClassOfInstance, stringify } from '@di/utils';

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

  public create<R extends T extends Constructable<infer R> ? R : T>(
    injector?: Injector | null,
    ctx?: Injector
  ): Promise<R> {
    const inj = injector ?? this._injector;
    const inquirerCtx = new InjectorInquirerContext(
      getClassOfInstance<typeof ComponentFactory>(this)
    );

    return ɵcreateBindingInstance(
      this.bindingRef,
      inj,
      ctx ?? null,
      inquirerCtx
    );
  }

  public toString() {
    return `ComponentFactory<${stringify(this.type)}>`;
  }
}
