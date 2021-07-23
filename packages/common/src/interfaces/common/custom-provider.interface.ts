import { Type } from '../type.interface';

export type IProviderFactory<T = any> = (
  ...injectArgs: any[]
) => T | Promise<T>;

/**
 * Creates a custom provider that can be injected using the @Inject parameter decorator.
 */
export type CustomProvider = FactoryProvider | ClassProvider | ValueProvider;

/**
 * Creates a custom factory provider that can be injected using the @Inject parameter decorator.
 */
export interface FactoryProvider {
  /**
   * The name of the provider. This name can then be used as the injection token for the @inject decorator.
   */
  provide: string | Function;
  /**
   * A factory function that returns the instance of the provider.
   */
  useFactory: IProviderFactory;
  /**
   * Providers that should be injected to the factory | class constructor function when it's called.
   * inejct: ['a'] => factory(...['a'])
   */
  inject?: (Type | string)[];
}

/**
 * Creates a custom calss provider that can be injected using the @Inject parameter decorator.
 */
export interface ClassProvider {
  /**
   * The name of the provider. This name can then be used as the injection token for the @inject decorator.
   */
  provide: string | Function;
  /**
   * A value that should whose instance should be set as the instance of the provider.
   */
  useClass: Type;
  /**
   * Providers that should be injected to the factory | class constructor function when it's called.
   * inejct: ['a'] => factory(...['a'])
   */
  inject?: (Type | string)[];
}

/**
 * Creates a custom value provider that can be injected using the @Inject parameter decorator.
 */
export interface ValueProvider {
  /**
   * The name of the provider. This name can then be used as the injection token for the @inject decorator.
   */
  provide: string | Function;
  /**
   * A value that should be set as the instance of the provider.
   */
  useValue: unknown;
}
