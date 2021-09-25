import { InjectorScope } from '@decorators';

import { Type } from '../type.interface';
import { InjectionToken } from './injection-token';

export type FactoryProviderFn<T = any, I extends any[] = any[]> = (
  ...injectArgs: I
) => T | Promise<T>;

/**
 * Creates a custom provider that can be injected using the @Inject parameter decorator.
 */
export type CustomProvider =
  | FactoryProvider
  | ClassProvider
  | ValueProvider
  | UseExistingProvider;

export interface CustomProviderBase {
  /**
   * The name of the provider. This name can then be used as the injection token for the @inject decorator.
   */
  provide: InjectionToken | Function;
  /** {@link InjectorScope} */
  scope?: InjectorScope;
}

/**
 * Creates a custom factory provider that can be injected using the @Inject parameter decorator.
 */
export interface FactoryProvider extends CustomProviderBase {
  /**
   * A factory function that returns the instance of the provider.
   */
  useFactory: FactoryProviderFn;
  /**
   * Providers that should be injected to the factory | class constructor function when it's called.
   * inejct: [SomeDependency] => factory(...[SomeDependency])
   */
  inject?: (Type | InjectionToken)[];
}

/**
 * Creates a custom class provider that can be injected using the @Inject parameter decorator.
 */
export interface ClassProvider extends CustomProviderBase {
  /**
   * A value that should whose instance should be set as the instance of the provider.
   */
  useClass: Type;
  /**
   * Providers that should be injected to the factory | class constructor function when it's called.
   * inejct: [SomeDependency] => factory(...[SomeDependency])
   */
  inject?: (Type | InjectionToken)[];
}

/**
 * Creates a custom value provider that can be injected using the @Inject parameter decorator.
 */
export interface ValueProvider extends CustomProviderBase {
  /**
   * A value that should be set as the instance of the provider.
   */
  useValue: unknown;
}

/** Creates a new provider that is identical to the `useExisting` value */
export interface UseExistingProvider extends CustomProviderBase {
  /**
   * A reference to the existing provider.
   */
  useExisting: ClassProvider | FactoryProvider | ValueProvider;
}
