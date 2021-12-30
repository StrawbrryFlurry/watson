import { Type } from '@di/types';

import { InjectionToken } from './injection-token';

export type FactoryProviderFn<T = any, I extends any[] = any[]> = (
  ...injectArgs: I
) => T | Promise<T>;

/**
 * Custom providers allow users to define
 * different kinds of provider values for
 * and resolution strategies for a given token.
 */
export type CustomProvider<T = any> =
  | FactoryProvider<T>
  | ClassProvider
  | ValueProvider
  | UseExistingProvider;

export interface CustomProviderBase {
  /**
   * The name of the provider. This name can then be used
   * as the injection token for the @inject decorator or,
   * if it's a class type, as the parameter type.
   */
  provide: InjectionToken | Function;
  /**
   * When true, injector returns an array of instances.
   * This is useful to allow multiple providers spread across many
   * files to provide configuration information to a common token.
   */
  multi?: boolean;
}

interface ProviderHasDeps {
  /**
   * Providers that should be injected to the factory | class constructor
   *  function when it's called.
   * deps: [SomeDependency] => factory(...[SomeDependency])
   */
  deps?: (Type | InjectionToken)[];
}

/**
 * FactoryProviders allow for custom, possibly
 * asynchronous resolution of any value that is
 * returned from the factory function.
 */
export interface FactoryProvider<T = any>
  extends CustomProviderBase,
    ProviderHasDeps {
  /**
   * A factory function that returns the instance of the provider.
   */
  useFactory: FactoryProviderFn<T>;
}

/**
 * ClassProviders work like regular provider
 * types but instead of the token type provide
 * an instance of `useClass`.
 */
export interface ClassProvider extends CustomProviderBase, ProviderHasDeps {
  /**
   * A value that should whose instance should
   * be set as the instance of the provider.
   */
  useClass: Type;
}

/**
 * ValueProviders are a 1-1 mapping
 * of a token and a value.
 */
export interface ValueProvider extends CustomProviderBase {
  /**
   * A value that should be set as
   * the instance of the provider.
   */
  useValue: unknown;
}

/**
 * Creates a new provider that is identical
 * to the `useExisting` token in the injector
 */
export interface UseExistingProvider extends CustomProviderBase {
  /**
   * A reference to the existing provider.
   */
  useExisting: Type | InjectionToken;
}
