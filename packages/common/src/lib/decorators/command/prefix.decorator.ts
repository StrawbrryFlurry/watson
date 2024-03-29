import { Prefix } from '@common/command/common';
import { PREFIX_METADATA } from '@common/constants';
import { isMethodDecorator } from '@common/utils';

/**
 * Assigns a prefix to the decorated
 * command or router.
 */
export function UsePrefix(prefix: Prefix): ClassDecorator | MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return Reflect.defineMetadata(PREFIX_METADATA, prefix, descriptor.value);
    }

    Reflect.defineMetadata(PREFIX_METADATA, prefix, target);
  };
}
