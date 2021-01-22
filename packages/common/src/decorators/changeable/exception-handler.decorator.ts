import { EXCEPTION_HANDLER_METADATA } from '../../constants';
import { EventExceptionHandler } from '../../exceptions';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export function UseExceptionHandler(
  ...handlers: typeof EventExceptionHandler[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertykey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(
        EXCEPTION_HANDLER_METADATA,
        handlers,
        descriptor.value
      );
    }

    // Is class decorator
    applyStackableMetadata(EXCEPTION_HANDLER_METADATA, handlers, target);
  };
}
