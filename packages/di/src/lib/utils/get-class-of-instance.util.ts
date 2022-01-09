import { Type } from '@di/types';

export function getClassOfInstance<T extends Type = Type>(instance: object): T {
  const prototype = <object>Object.getPrototypeOf(instance);
  return <T>prototype.constructor;
}
