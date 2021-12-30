import { Injectable } from '@di/decorators/injectable.decorator';
import { CustomProvider } from '@di/providers/custom-provider.interface';
import { InjectionToken, InjectorLifetime, Providable } from '@di/providers/injection-token';
import { Type } from '@di/types';

import { DynamicInjector } from './dynamic-injector';
import { NullInjector } from './null-injector';

import type { InjectorInquirerContext } from "./inquirer-context";
export type ProviderResolvable<T = any> = CustomProvider<T> | Type<T>;

/**
 * Type to imitate the injector
 * lookup of provider `T` and the
 * value that that provider would
 * resolve to.
 */
export type InjectorGetResult<
  T,
  Multi extends boolean = false
> = T extends InjectionToken<infer R>
  ? R
  : T extends new (...args: any[]) => infer R
  ? Multi extends false
    ? R
    : R[]
  : T extends abstract new (...args: any[]) => any
  ? Multi extends false
    ? InstanceType<T>
    : InstanceType<T>[]
  : never;

/**
 * If it's okay for the injector to
 * not find a specific token, provide
 * this constant as the default value.
 * That way, if no provider is found,
 * it is returned by the `NullInjector`.
 *
 * This does *NOT* work for any dependencies
 * that are resolved while creating the
 * provider as it could lead to unpredictable
 * behavior.
 */
export const NOT_FOUND = {};

const CREATE_INJECTOR = (
  providers: ProviderResolvable[],
  parent: Injector | null = null,
  scope: any | null = null
) => new DynamicInjector(providers, parent, scope);

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
export abstract class Injector {
  public parent: Injector | null = null;

  /**
   * Retrieves an instance of `typeOrToken` from the injector.
   * Dependencies are resolved upwards the injector chain if
   * the token is not specified to be found within the current
   * injector - `providedIn: "module"`.
   *
   * Provide an additional context injector if the dependency
   * relies on providers only available within an additional,
   * external, injector.
   *
   * @see ProvidedInScope
   */
  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector | null,
    inquirerContext?: InjectorInquirerContext
  ): Promise<R>;

  /**
   * Creates a new instance of the current injector
   * implementation - {@link CREATE_INJECTOR}.
   *
   * Use this method instead of the constructor method
   * on the injector implementation as it might be subject
   * to change in the future.
   */
  static create(
    /**
     * Providers that are mapped to the injector
     */
    providers: ProviderResolvable[],
    /**
     * This injector's parent injector,
     * the root-, platform-injector or
     * the NULL-injector.
     */
    parent: Injector | null = null,
    /**
     * The scope in which the injector
     * was created. This can be a ModuleRef,
     * RouterRef, any specific component or
     * `null` if it does not belong to any
     * specific context.
     */
    scope: any | null = null
  ) {
    return CREATE_INJECTOR(providers, parent, scope);
  }

  /**
   * `NullInjector` implementation
   */
  public static readonly NULL = new NullInjector();
}
