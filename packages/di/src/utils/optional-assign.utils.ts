import { isNil } from "@di/utils/common";

export function optionalAssign<T>(
  target: Object,
  propertyKey: string | symbol,
  value: T
): T {
  if (!target.hasOwnProperty(propertyKey) && !isNil(target[propertyKey])) {
    target[propertyKey] = value;
  }

  return value;
}
