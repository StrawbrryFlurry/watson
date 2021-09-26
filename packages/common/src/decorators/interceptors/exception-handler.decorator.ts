import { EXCEPTION_HANDLER_METADATA } from '@constants';
import { InterceptorMetadata } from '@decorators';
import { RuntimeException } from '@exceptions';
import { ExceptionHandler, InjectionToken } from '@interfaces';
import { isMethodDecorator } from '@utils';

import { applyStackableMetadata } from '../apply-stackable-metadata';

interface WithCatch {
  prototype: ExceptionHandler;
}

export type ExceptionHandlerFn = (exception: RuntimeException) => void;

export const GLOBAL_EXCEPTION_HANDLER = new InjectionToken<
  InterceptorMetadata[]
>("Exception handler that are applied globally");

export const EXCEPTION_HANDLER = new InjectionToken<InterceptorMetadata[]>(
  "Exception handler for the current module"
);

export type ExceptionHandlerMetadata =
  | WithCatch
  | ExceptionHandler
  | ExceptionHandlerFn;

export function UseExceptionHandler(
  ...handlers: ExceptionHandler[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(
        EXCEPTION_HANDLER_METADATA,
        descriptor!.value,
        handlers
      );
    }

    applyStackableMetadata(
      EXCEPTION_HANDLER_METADATA,
      target.constructor,
      handlers
    );
  };
}
