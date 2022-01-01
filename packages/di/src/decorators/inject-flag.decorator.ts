import { InjectFlag, InjectFlagDecorator, makeInjectFlagDecorator } from '@di/providers/inject-flag';

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

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to mark them as optional.
 * The DI framework provides null if the dependency
 * is not found.
 */
export const Optional: InjectFlagDecorator = makeInjectFlagDecorator(
  InjectFlag.Optional
);

/**
 * Decorator to be used on constructor parameters or
 * factory dependencies to specify the injector lookup
 * behavior.
 *
 * This will skip the current injector and start the
 * resolution from the closest host e.g. Module injector.
 */
export const Host: InjectFlagDecorator = makeInjectFlagDecorator(
  InjectFlag.Host
);

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
export const Self: InjectFlagDecorator = makeInjectFlagDecorator(
  InjectFlag.Self
);

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
export const SkipSelf: InjectFlagDecorator = makeInjectFlagDecorator(
  InjectFlag.SkipSelf
);
