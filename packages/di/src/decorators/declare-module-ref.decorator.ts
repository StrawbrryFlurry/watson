import { MODULE_REF_IMPL_METADATA } from '@di/constants';
import { Injector } from '@di/core/injector';

export function DeclareModuleRef(): ClassDecorator {
  return (target: Object) => {
    Reflect.defineMetadata(MODULE_REF_IMPL_METADATA, target, Injector);
  };
}
