import { isMethodDecorator } from '@utils';

import { PREFIX_METADATA } from '../../constants';
import { Prefix } from '../../interfaces';

/**
 * Assigns a prefix to the decorated
 * command or receiver.
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
