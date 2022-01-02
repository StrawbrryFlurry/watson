import { Type } from '@di/types';
import { isFunction } from '@di/utils/common';

const FORWARD_REF_KEY = "ɵfwd";

/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined.
 *
 * Refer to the {@link [Angular usage notes of forward ref](https://angular.io/api/core/forwardRef)}
 *
 * ForwardRef does not, like in NestJS, help you to resolve circular dependencies.
 * You should use {@link Lazy} for that purpose.
 */
export function forwardRef<T extends () => Type>(forwardRefFn: T): T {
  forwardRefFn[FORWARD_REF_KEY] = forwardRef;
  return forwardRefFn;
}

export function resolveForwardRef<T, R extends T extends () => infer R ? R : T>(
  forwardRefFn: T
): R {
  return isForwardRef(forwardRefFn)
    ? (forwardRefFn() as R)
    : (forwardRefFn as R);
}

export function isForwardRef(forwardRefFn: any): forwardRefFn is () => Type {
  return (
    isFunction(forwardRefFn) &&
    (forwardRefFn as Object).hasOwnProperty(FORWARD_REF_KEY) &&
    forwardRefFn[FORWARD_REF_KEY] === forwardRef
  );
}
