/**
 * A Type is most likely a class definition provided by Reflect.
 */
export type Type<T = any> =
  | (new (...args: any[]) => T)
  | Object
  | object
  | Function
  | T;
