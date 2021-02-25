import { PREFIX_METADATA } from '../../constants';
import { CommandPrefix } from '../../interfaces';

/**
 * Assings a custom prefix class to the decorated command.
 */
export function UsePrefix(prefix: CommandPrefix): MethodDecorator {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      return Reflect.defineMetadata(PREFIX_METADATA, prefix, descriptor.value);
    }

    // Is class decorator
    Reflect.defineMetadata(PREFIX_METADATA, prefix, target);
  };
}
