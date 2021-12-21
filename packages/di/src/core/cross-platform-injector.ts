import { Providable } from "@di/providers";

import { Injector, InjectorGetResult } from "./injector";

/**
 * When working with other DI capable frameworks
 * like NestJs we need a way for these different
 * injector models to interact to each other and
 * resolve providers that are available in
 * the other di constructs.
 *
 * When building an adapter for other frameworks,
 * provide a concrete implementation of this class
 * patching the injector of that framework as well
 * as combining it with Watson's injector.
 */
export abstract class CrossPlatformInjector implements Injector {
  public parent: Injector | null;

  constructor(injector: Injector) {
    this.parent = injector;
  }

  public abstract get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T,
    notFoundValue?: any,
    ctx?: Injector
  ): Promise<R>;

  /**
   * Watson will call this method on any cross platform
   * injector that is loaded for compatible frameworks.
   *
   * This method is meant to monkey patch the other
   * platform's DI framework to use Watson's injector
   * in order to resolve dependencies as well as
   * allowing this injector to resolve dependencies
   * from that other DI framework.
   *
   * @See `@watsonjs/nest`
   */
  public abstract patchCrossPlatformInjector(): Promise<void> | void;
}
