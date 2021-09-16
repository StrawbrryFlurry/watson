import { isFunction, Type } from '@watsonjs/common';

const FORWARD_REF_KEY = "__forward_ref__";

/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * Refer to the Angular usage notes of forward ref
 */
export function forwardRef(forwardRefFn: () => Type) {
  Object.defineProperty(forwardRefFn, FORWARD_REF_KEY, {
    value: forwardRef,
  });
  return forwardRefFn;
}

export function resolveForwardRef<T, R extends T extends () => infer R ? R : T>(
  forwardRefFn: T
): R {
  return isForwardRef(forwardRefFn) ? forwardRefFn() : (forwardRefFn as R);
}

export function isForwardRef(forwardRefFn: any): forwardRefFn is () => Type {
  return (
    isFunction(forwardRefFn) &&
    (forwardRefFn as Object).hasOwnProperty(FORWARD_REF_KEY) &&
    forwardRefFn === forwardRef
  );
}
