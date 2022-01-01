import { EXCEPTION_HANDLER_METADATA } from '@common/constants';
import { RuntimeException } from '@common/exceptions';
import { W_INT_TYPE } from '@common/fields';
import { InjectionToken } from '@watsonjs/di';
import { Observable } from 'rxjs';

import { applyInterceptorMetadata, ɵINTERCEPTOR_TYPE } from './interceptor';

export interface ExceptionHandler {
  catch(exception: RuntimeException): void | Promise<void> | Observable<void>;
}

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

export function Catch(
  handler: ExceptionHandlerMetadata
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInterceptorMetadata(
      ɵINTERCEPTOR_TYPE.ExceptionHandler,
      EXCEPTION_HANDLER_METADATA,
      [handler],
      target,
      descriptor
    );
  };
}
