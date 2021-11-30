import { isNil } from './shared.utils';

export function optionalAssign<T>(
  target: Object,
  propertyKey: string,
  value: T
): T {
  if (!target.hasOwnProperty(propertyKey) && !isNil(target[propertyKey])) {
    target[propertyKey] = value;
  }

  return value;
}
