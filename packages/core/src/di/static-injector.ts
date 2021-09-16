import { Binding, Injector } from '@di';

/**
 * Resolves different types of
 * providers by calling their
 * constructors / factory function
 * using given dependencies
 */
export class StaticInjector implements Injector {
  public parent: Injector | null;

  /**
   * Resolves a providable type `metatype`
   * using already resolved dependencies
   */
  public resolve<T extends unknown = any>(metatype: any, deps: Binding[]): T {
    throw new Error("Method not implemented.");
  }
}
