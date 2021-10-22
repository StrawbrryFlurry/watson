import {
  HasProvLifetime,
  HasProvScope,
  InjectorLifetime,
  isEmpty,
  isNil,
  Providable,
  ProvidedInScope,
  Type,
  W_ELEMENT_ID,
  W_PROV_LIFETIME,
} from '@watsonjs/common';
import { Observable } from 'rxjs';

export type NewableTo<T = any, D extends Array<any> = any[]> = new (
  ...args: D
) => T;
export type FactoryFn<T = any, D extends Array<any> = any[]> = (
  ...args: D
) => T;

export interface WatsonDiProvidable {
  [W_ELEMENT_ID]: number;
}

/**
 * A binding represents a provider
 * in a given module context.
 *
 * The `Binding` wrapper for a provider
 * stores additional information about the
 * binding which can be reused if a module
 * provider is used in another injector
 * context (By exporting it from the module).
 */
export class Binding<
  MetaType extends
    | NewableTo<InstanceType>
    | FactoryFn<InstanceType>
    | Type = any,
  Deps extends (HasProvLifetime & HasProvScope)[] = any,
  InstanceType extends any = MetaType
> {
  /** The type this binding represents */
  public metatype: MetaType;

  /** The token with which the binding can be resolved */
  public readonly token: Providable;

  /**
   * If the binding has any dependencies,
   * this property contains all the tokens
   * that should be injected as an argument
   * to resolve the factory function.
   *
   * [SomeService, SomeContextProperty]
   */
  public deps: Deps | null;

  public multi: boolean = false;

  private _isTreeStatic: boolean | null = null;

  public isTransient() {
    return this.lifetime & InjectorLifetime.Event;
  }

  public isDependencyTreeStatic(): boolean {
    if (!isNil(this._isTreeStatic)) {
      return this._isTreeStatic;
    }

    if (!this.hasDependencies()) {
      this._isTreeStatic = true;
      return true;
    }

    for (let i = 0; i < this.deps!.length; i++) {
      const dep = this.deps![i];
      const lifetime = dep[W_PROV_LIFETIME];

      if (lifetime & (InjectorLifetime.Event | InjectorLifetime.Transient)) {
        this._isTreeStatic = false;
        return false;
      }
    }

    this._isTreeStatic = true;
    return true;
  }

  public hasStaticInstance(): boolean {
    return this.isDependencyTreeStatic() && !isNil(this.instance);
  }

  public hasDependencies(): boolean {
    return !isNil(this.deps) && !isEmpty(this.deps);
  }

  /**
   * If the provider is a singleton,
   * the instance type is stored in
   * this property of the binding.
   */
  public instance: InstanceType | InstanceType[] | null;

  /** {@link  InjectorLifetime} */
  public readonly lifetime: InjectorLifetime;
  /** {@link ProvidedInScope} */
  public readonly scope: ProvidedInScope;

  constructor(
    token: Providable,
    lifetime: InjectorLifetime,
    scope: ProvidedInScope,
    factory?: () => InstanceType
  ) {
    this.token = token;
    this.lifetime = lifetime;
    this.scope = scope;

    this.factory = factory! ?? undefined;
  }

  /**
   * Internal factory function that will
   * be called by the injector to create a
   * new instance of the provider.
   */
  public factory!: (
    ...deps: Deps
  ) => Observable<InstanceType> | Promise<InstanceType> | InstanceType;
}
