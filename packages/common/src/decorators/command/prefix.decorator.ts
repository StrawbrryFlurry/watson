import { PREFIX_METADATA } from '../../constants';
import { ICommandPrefix } from '../../interfaces';
import { isNil } from '../../utils';

/**
 * Assings a custom prefix class to the decorated command.
 */
export function UsePrefix(prefix: ICommandPrefix): MethodDecorator {
  return (
    target: Object,
    propertyKey: string,
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
