import { EXCEPTION_HANDLER_METADATA } from '@common/constants';
import { RuntimeException } from '@common/exceptions';
import { AsyncResolvable } from '@common/utils';

import { applyInterceptorMetadata, ɵINTERCEPTOR_TYPE } from './interceptor';

export abstract class ExceptionHandler {
  /**
   * Handle the exception thrown by the application.
   * If the handler cannot handle the exception, you
   * can return the exception from the handler for it
   * to be handled by the default handler. You can also
   * use the default handler by injecting the
   * `DefaultExceptionHandler`.
   */
  public abstract catch<T extends RuntimeException>(
    exception: T
  ): AsyncResolvable<void | T>;
}

interface WithCatch {
  prototype: ExceptionHandler;
}

export type ExceptionHandlerMetadata = WithCatch | ExceptionHandler;

export function Catch(handler: ExceptionHandlerMetadata): ClassDecorator {
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
