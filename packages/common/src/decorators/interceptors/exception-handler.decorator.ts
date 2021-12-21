import { EXCEPTION_HANDLER_METADATA } from "@common/constants";
import { ExceptionHandler } from "@common/exceptions";
import { W_INT_TYPE } from "@common/fields";
import { InjectionToken } from "@watsonjs/di";

import { applyInterceptorMetadata, ɵINTERCEPTOR_TYPE } from "./is-interceptor";

interface WithCatch {
  prototype: ExceptionHandler;
}

export const GLOBAL_EXCEPTION_HANDLER = new InjectionToken<
  ExceptionHandlerMetadata[]
>("Exception handler that are applied globally", {
  providedIn: "root",
});

GLOBAL_EXCEPTION_HANDLER[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.ExceptionHandler;

export const EXCEPTION_HANDLER = new InjectionToken<ExceptionHandlerMetadata[]>(
  "Exception handler for the current module",
  { providedIn: "module" }
);

EXCEPTION_HANDLER[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.ExceptionHandler;

export type ExceptionHandlerMetadata = WithCatch | ExceptionHandler;

export function UseExceptionHandler(
  ...handlers: ExceptionHandlerMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInterceptorMetadata(
      ɵINTERCEPTOR_TYPE.ExceptionHandler,
      EXCEPTION_HANDLER_METADATA,
      handlers,
      target,
      descriptor
    );
  };
}
