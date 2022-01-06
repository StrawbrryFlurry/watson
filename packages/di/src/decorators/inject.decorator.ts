import { InjectFlag, makeInjectFlagDecorator, makeProviderInjectDecorator } from '@di/providers/inject-flag';

import type { LazyProvided } from "@di/types";

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to mark them as optional.
 * The DI framework provides null if the dependency
 * is not found.
 */
export const Optional = makeInjectFlagDecorator(InjectFlag.Optional);

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to specify the injector lookup
 * behavior.
 *
 * This will skip the current injector and start the
 * resolution from the closest host e.g. Module injector.
 */
export const Host = makeInjectFlagDecorator(InjectFlag.Host);

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to specify the injector lookup
 * behavior.
 *
 * If the dependency is not found in the current
 * injector, it will throw a NullInjector error even
 * if the provider scope would allow it to be resolved
 * in a parent injector.
 */
export const Self = makeInjectFlagDecorator(InjectFlag.Self);

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to specify the injector lookup
 * behavior.
 *
 * Skips the current injector and instead
 * uses the parent injector to resolve the dependency.
 * Usually, this is used to resolve the dependency
 * in the module injector.
 */
export const SkipSelf = makeInjectFlagDecorator(InjectFlag.SkipSelf);

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to specify the injector lookup
 * behavior.
 *
 * Wraps the dependency in a {@link LazyProvided} object
 * which can be used to lazily resolve that dependency.
 * The dependency will be resolved only when a property
 * on the object is accessed or the `get` method is called.
 *
 * Note that all subsequent property accesses, after an initially
 * awaited `.get` or any other property of that proxy, will be
 * synchronous.
 *
 * ```ts
 * class Boop {
 *   public boop: string;
 * }
 *
 * class HasLazy {
 *  constructor(@Lazy(Boop) public lazy: LazyProvided<Boop>) {}
 *
 *  public async getBoop(): Promise<string> {
 *    const boop = await this.lazy.boop;
 *    return boop;
 *  }
 *
 *  public async getBoopInstance(): Promise<void> {
 *   const boop: Boop = await this.lazy.get();
 *  }
 * }
 * ```
 */
export const Lazy = makeInjectFlagDecorator(
  InjectFlag.Lazy,
  makeProviderInjectDecorator
);

/**
 * Injects an instance for `token` into the
 * decorated parameter of a class constructor.
 *
 * This decorator doesn't do anything in
 * class methods. That behavior is to be
 * implemented by other framework specific
 * tools.
 */
export const Inject = makeInjectFlagDecorator(
  InjectFlag.Inject,
  makeProviderInjectDecorator
);

declare const _: LazyProvided<any>;
