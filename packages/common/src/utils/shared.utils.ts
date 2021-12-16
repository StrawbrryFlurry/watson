/* eslint-disable @typescript-eslint/no-use-before-define */
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === "undefined";

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === "object";

export const isPlainObject = (fn: any): fn is object => {
  if (!isObject(fn)) {
    return false;
  }
  const proto = Object.getPrototypeOf(fn);
  if (proto === null) {
    return true;
  }
  const ctor =
    Object.prototype.hasOwnProperty.call(proto, "constructor") &&
    proto.constructor;
  return (
    typeof ctor === "function" &&
    ctor instanceof ctor &&
    Function.prototype.toString.call(ctor) ===
      Function.prototype.toString.call(Object)
  );
};

export const validatePath = (path?: string): string =>
  path ? (path.charAt(0) !== "/" ? "/" + path : path) : "";

export const isFunction = (fn: any): fn is Function => typeof fn === "function";
export const isString = (fn: any): fn is string => typeof fn === "string";
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null;
export const isEmpty = (array: any): boolean => !(array && array.length > 0);
export const isNilOrEmpty = (string: string): boolean =>
  isNil(string) || string.length === 0;
export const isSymbol = (fn: any): fn is symbol => typeof fn === "symbol";
export const isClassConstructor = (fn: any): fn is NewableFunction =>
  isFunction(fn) && /^class\s/.test((fn as Function).toString());
