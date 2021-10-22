import { EXCEPTION_HANDLER_METADATA } from '@common/constants';
import { InterceptorMetadata } from '@common/decorators';
import { RuntimeException } from '@common/exceptions';
import { ExceptionHandler, InjectionToken } from '@common/interfaces';

import { W_INJ_TYPE } from '../..';
import { applyInjectableMetadata, ɵINJECTABLE_TYPE } from './is-injectable';

interface WithCatch {
  prototype: ExceptionHandler;
}

export type ExceptionHandlerFn = (exception: RuntimeException) => void;

export const GLOBAL_EXCEPTION_HANDLER = new InjectionToken<
  InterceptorMetadata[]
>("Exception handler that are applied globally", {
  providedIn: "root",
});

GLOBAL_EXCEPTION_HANDLER[W_INJ_TYPE] = ɵINJECTABLE_TYPE.ExceptionHandler;

export const EXCEPTION_HANDLER = new InjectionToken<InterceptorMetadata[]>(
  "Exception handler for the current module",
  { providedIn: "module" }
);

EXCEPTION_HANDLER[W_INJ_TYPE] = ɵINJECTABLE_TYPE.ExceptionHandler;

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
    return applyInjectableMetadata(
      ɵINJECTABLE_TYPE.ExceptionHandler,
      EXCEPTION_HANDLER_METADATA,
      handlers,
      target,
      descriptor
    );
  };
}
