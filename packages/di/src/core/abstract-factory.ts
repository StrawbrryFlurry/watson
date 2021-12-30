import type { Binding } from "@di/core/binding";
import type { Injector } from "@di/core/injector";
import type { ModuleRef } from "@di/core/module-ref";
import type { Constructable, Type } from "@di/types";

export abstract class AbstractInjectableFactoryResolver<
  T extends AbstractInjectableFactory = AbstractInjectableFactory
> {
  protected _moduleRef: ModuleRef;
  protected _records = new WeakMap<Type, T>();

  constructor(moduleRef: ModuleRef) {
    this._moduleRef = moduleRef;
  }

  public abstract resolve<T extends Type>(
    provider: T,
    moduleRef?: ModuleRef
  ): Promise<AbstractInjectableFactory<T>>;
}

export abstract class AbstractInjectableFactory<T extends Type = Type> {
  public type: T;
  public bindingRef: Binding<T, any, T>;
  protected _injector: Injector;

  constructor(type: T, injector: Injector) {
    this.type = type;
    this._injector = injector;
  }

  public abstract create<R extends T extends Constructable<infer R> ? R : T>(
    injector?: Injector | null,
    ctx?: Injector
  ): Promise<R>;
}
