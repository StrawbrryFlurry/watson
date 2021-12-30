import { MODULE_REF_IMPL_METADATA } from '@di/constants';
import { Injector } from '@di/core/injector';

/**
 * Declares the decorated class as the `ModuleRef`
 * implementation for this application. You can only
 * use this decorator on one type.
 */
export function DeclareModuleRef(): ClassDecorator {
  return (target: Object) => {
    Reflect.defineMetadata(MODULE_REF_IMPL_METADATA, target, Injector);
  };
}
