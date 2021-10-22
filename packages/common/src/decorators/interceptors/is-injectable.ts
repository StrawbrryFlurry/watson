import { W_INJ_TYPE } from '@common/fields';
import { isMethodDecorator } from '@common/utils';

import { applyStackableMetadata } from '..';

export enum ɵINJECTABLE_TYPE {
  Guard,
  Prefix,
  ExceptionHandler,
  Interceptor,
  Pipe,
  Filter,
}

export interface IsInjectable {
  [W_INJ_TYPE]: ɵINJECTABLE_TYPE;
}

export function ɵDefineInjectableType(
  injectables: (object | Function)[],
  type: ɵINJECTABLE_TYPE
) {
  for (const injectable of injectables) {
    injectable[W_INJ_TYPE] = type;
  }
}

export function applyInjectableMetadata<T extends Array<unknown>>(
  type: ɵINJECTABLE_TYPE,
  metadata: string,
  payload: T,
  target: any,
  descriptor?: PropertyDescriptor
) {
  ɵDefineInjectableType(payload as Function[], type);

  if (isMethodDecorator(descriptor)) {
    return applyStackableMetadata(metadata, descriptor!.value, payload);
  }

  applyStackableMetadata(metadata, target.constructor, payload);
}
