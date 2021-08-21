import { EXCEPTION_HANDLER_METADATA } from '../../constants';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export type TExceptionHanlderMetadata = typeof EventExceptionHandler[];

export function UseExceptionHandler(
  ...handlers: typeof EventExceptionHandler[]
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
