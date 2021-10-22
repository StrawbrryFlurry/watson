import { MODULE_GLOBAL_METADATA } from '@common/constants';

export function Global(): ClassDecorator {
  return (target: Object) => {
    Reflect.defineMetadata(MODULE_GLOBAL_METADATA, true, target);
  };
}
