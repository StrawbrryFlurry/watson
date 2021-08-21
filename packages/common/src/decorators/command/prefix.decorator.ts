import { PREFIX_METADATA } from '../../constants';
import { Prefix } from '../../interfaces';
import { isNil } from '../../utils';

/**
 * Assings a custom prefix class to the decorated command.
 */
export function UsePrefix(prefix: Prefix): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    // Is method decorator
    if (!isNil(descriptor)) {
      return Reflect.defineMetadata(PREFIX_METADATA, prefix, descriptor.value);
    }

    // Is class decorator
    Reflect.defineMetadata(PREFIX_METADATA, prefix, target);
  };
}
