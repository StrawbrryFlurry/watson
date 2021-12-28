import { applyStackableMetadata } from '@common/decorators/apply-stackable-metadata';
import { W_INT_TYPE } from '@common/fields';
import { isMethodDecorator } from '@common/utils';

export enum ɵINTERCEPTOR_TYPE {
  Guard,
  Prefix,
  ExceptionHandler,
  Interceptor,
  Pipe,
  Filter,
}

export interface ɵInterceptor {
  [W_INT_TYPE]: ɵINTERCEPTOR_TYPE;
}

function ɵdefineInterceptorType(
  interceptors: (object | Function)[],
  type: ɵINTERCEPTOR_TYPE
) {
  for (const interceptor of interceptors) {
    interceptor[W_INT_TYPE] = type;
  }
}

export function applyInterceptorMetadata<T extends Array<unknown>>(
  type: ɵINTERCEPTOR_TYPE,
  metadata: string,
  payload: T,
  target: any,
  descriptor?: PropertyDescriptor
) {
  ɵdefineInterceptorType(payload as Function[], type);

  if (isMethodDecorator(descriptor)) {
    return applyStackableMetadata(metadata, descriptor!.value, payload);
  }

  applyStackableMetadata(metadata, target.constructor, payload);
}
