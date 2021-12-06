import { EXCEPTION_HANDLER_METADATA } from '@common/constants';
import { InjectionToken } from '@common/di/injection-token';
import { ExceptionHandler } from '@common/exceptions';
import { W_INJ_TYPE } from '@common/fields';

import { applyInjectableMetadata, ɵINJECTABLE_TYPE } from './is-injectable';

interface WithCatch {
  prototype: ExceptionHandler;
}

export const GLOBAL_EXCEPTION_HANDLER = new InjectionToken<
  ExceptionHandlerMetadata[]
>("Exception handler that are applied globally", {
  providedIn: "root",
});

GLOBAL_EXCEPTION_HANDLER[W_INJ_TYPE] = ɵINJECTABLE_TYPE.ExceptionHandler;

export const EXCEPTION_HANDLER = new InjectionToken<ExceptionHandlerMetadata[]>(
  "Exception handler for the current module",
  { providedIn: "module" }
);

EXCEPTION_HANDLER[W_INJ_TYPE] = ɵINJECTABLE_TYPE.ExceptionHandler;

export type ExceptionHandlerMetadata = WithCatch | ExceptionHandler;

export function UseExceptionHandler(
  ...handlers: ExceptionHandlerMetadata[]
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
