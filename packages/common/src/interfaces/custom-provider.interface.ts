import { Type } from './type.interface';

export type IProviderFactory<T = any> = (
  ...injectArgs: unknown[]
) => T | Promise<T>;

/**
 * Creates a custom provider that can be injected using the @Inject parameter decorator.
 */
export interface CustomProvider {
  /**
   * The name of the provider. This name can then be used as the injection token for the @inject decorator.
   */
  provide: string;
  /**
   * A factory function that returns the instance of the provider.
   */
  useFactory?: IProviderFactory;
  /**
   * A value that should be set as the instance of the provider.
   */
  useValue?: unknown;
  /**
   * A value that should whose instance should be set as the instance of the provider.
   */
  useClass?: Type;
  /**
   * Providers that should be injected to the factory | class constructor function when it's called.
   * inejct: ['a'] => factory(...['a'])
   */
  inject?: (Type | string)[];
}
