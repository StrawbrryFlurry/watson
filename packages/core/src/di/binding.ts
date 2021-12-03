import { InjectorLifetime, isEmpty, isNil, Providable, ProvidedInScope, Type, W_ELEMENT_ID } from '@watsonjs/common';
import { Observable } from 'rxjs';

import { getInjectableDef, Injector, InjectorGetResult } from '..';

export type NewableTo<T = any, D extends Array<any> = any[]> = new (
  ...args: D
) => T;
export type FactoryFn<T = any, D extends Array<any> = any[]> = (
  ...args: D
) => T;
export type FactoryFnWithoutDeps<T = any> = () => T;

export interface WatsonDiProvidable {
  [W_ELEMENT_ID]: number;
}

const SINGLETON_BINDING_CONTEXT: Injector = <any>{};

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
  Token extends Providable = Providable,
  Deps extends Providable[] = Providable[],
  InstanceType extends any = InjectorGetResult<Token>,
  Factory extends (...deps: Deps) => InstanceType = any
> {
  /** The type this binding represents */
  public metatype: Type | Function | any;

  /** The token with which the binding can be resolved */
  public readonly token: Providable;

  public get name() {
    return this.token.name;
  }

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
  /**
   * Whether the binding has any
   * dependencies.
   */
  private _isTreeStatic: boolean | null = null;

  /**
   * If the provider is a singleton,
   * the instance type is stored in
   * this property of the binding.
   *
   * @key The context injector for which
   * the instance was created
   * @value The instance value
   */
  private _instances = new WeakMap<
    Injector,
    InstanceType | InstanceType[] | null
  >();

  /** {@link  InjectorLifetime} */
  public readonly lifetime: InjectorLifetime;
  /** {@link ProvidedInScope} */
  public readonly scope: ProvidedInScope;

  constructor(
    token: Token,
    lifetime: InjectorLifetime,
    scope: ProvidedInScope,
    factory?: Factory
  ) {
    this.token = token;
    this.lifetime = lifetime;
    this.scope = scope;

    this.factory = factory! ?? undefined;
  }

  public isTransient() {
    return this.lifetime & InjectorLifetime.Transient;
  }

  public getInstance(
    ctx?: Injector | null
  ): InstanceType | InstanceType[] | null {
    ctx ??= SINGLETON_BINDING_CONTEXT;
    return this._instances.get(ctx) ?? null;
  }

  public setInstance(instance: InstanceType, ctx?: Injector | null): void {
    // Handle `null` case.
    ctx ??= SINGLETON_BINDING_CONTEXT;
    this._instances.set(ctx, instance);
  }

  /**
   * Whether the binding has any
   * dependencies.
   */
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
      const { lifetime } = getInjectableDef(dep);

      if (lifetime & (InjectorLifetime.Event | InjectorLifetime.Transient)) {
        this._isTreeStatic = false;
        return false;
      }
    }

    this._isTreeStatic = true;
    return true;
  }

  public hasStaticInstance(): boolean {
    return this.isDependencyTreeStatic() && !isNil(this.getInstance());
  }

  public hasDependencies(): boolean {
    return !isNil(this.deps) && !isEmpty(this.deps);
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
