import { InjectorScope, Providable, Type, WATSON_ELEMENT_ID } from '@watsonjs/common';
import { Observable } from 'rxjs';

import { Module } from '.';

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
  public readonly host: Module | null;

  /**
   * If the binding has any dependencies,
   * this property contains all the tokens
   * that should be injected as an argument
   * to resolve the factory function.
   *
   * [SomeService, SomeContextProperty]
   */
  public ɵinject: Deps;

  /**
   * If the provider is a singleton,
   * the instance type is stored in
   * this property of the binding.
   */
  public instance: ResolvedBinding | null;

  /** The scope of this binding */
  public readonly scope: InjectorScope;

  constructor(
    token: Providable,
    scope: InjectorScope,
    factory?: () => InstanceType
  ) {
    this.token = token;
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

/**
 * A resolved instance of a
 * {@link Binding}. Depending on
 * the scope of a provider there
 * can be multiple resolved bindings
 * for a given `Binding`.
 *
 * The resolved binding stores
 * the value for a binding.
 */
export class ResolvedBinding<
  MetaType extends NewableTo<InstanceType> | FactoryFn<InstanceType> = any,
  Deps extends any[] = any,
  InstanceType extends any = any
> {
  /** The host binding */
  public readonly binding: Binding<MetaType, Deps, InstanceType>;

  /** The value or instance of this binding */
  public readonly instance: InstanceType;

  /** The id of the module this binding was resolved in */
  public readonly scope: string;

  constructor(
    binding: Binding<MetaType, Deps, InstanceType>,
    instance: InstanceType
  ) {
    this.binding = binding;
    this.instance = instance;
  }
}
