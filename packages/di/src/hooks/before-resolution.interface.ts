import { Injector } from '@di/core/injector';
import { InjectorInquirerContext } from '@di/core/inquirer-context';
import { Constructable, CtorParameters } from '@di/types';

/**
 * A hook on a class method that is called on
 * the class prototype before the class is
 * instantiated. You have the ability to update
 * dependencies that are passed to the class
 * constructor and return the updated dependencies.
 */
export interface BeforeResolution<T extends Constructable> {
  beforeResolution<D extends CtorParameters<T> = CtorParameters<T>>(
    injector: Injector,
    dependencies: D,
    inquirerContext: InjectorInquirerContext
  ): D | Promise<D>;
}
