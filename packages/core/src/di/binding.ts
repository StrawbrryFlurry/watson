import { Injector } from '@di';
import { InjectorLifetime, isEmpty, isNil, Providable, ProvidedInScope, Type, WATSON_ELEMENT_ID } from '@watsonjs/common';
import { Observable } from 'rxjs';

export type NewableTo<T = any, D extends Array<any> = any[]> = new (
  ...args: D
) => T;
export type FactoryFn<T = any, D extends Array<any> = any[]> = (
  ...args: D
) => T;

export interface WatsonDiProvidable {
  [WATSON_ELEMENT_ID]: number;
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
  Deps extends any[] = any,
  InstanceType extends any = any
> {
  /** The type this binding represents */
  public ɵmetatype: MetaType;

  /** The token with which the binding can be resolved */
  public readonly token: Providable;

  /** The module this binding belongs to */
  public readonly host: Injector | null;

  /**
   * If the binding has any dependencies,
   * this property contains all the tokens
   * that should be injected as an argument
   * to resolve the factory function.
   *
   * [SomeService, SomeContextProperty]
   */
  public ɵdeps: Deps | null;

  public multi: boolean = false;

  public optional: boolean = false;

  public isDependencyTreeStatic(): boolean {
    if (!this.hasDependencies()) {
      return true;
    }

    return false;
  }

  public hasDependencies(): boolean {
    return !isNil(this.ɵdeps) && !isEmpty(this.ɵdeps);
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

    this.ɵfactory = factory! ?? undefined;
  }

  /**
   * Internal factory function that will
   * be called by the injector to create a
   * new instance of the provider.
   */
  public ɵfactory!: (
    ...deps: Deps
  ) => Observable<InstanceType> | Promise<InstanceType> | InstanceType;
}
