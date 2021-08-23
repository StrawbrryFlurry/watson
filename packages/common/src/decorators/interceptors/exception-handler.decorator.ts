import { ExceptionHandler } from '@interfaces/exceptions';

import { EXCEPTION_HANDLER_METADATA } from '../../constants';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export function UseExceptionHandler(
  ...handlers: ExceptionHandler[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
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
