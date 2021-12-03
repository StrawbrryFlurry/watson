import { Type } from '@common/type';

export function applyStackableMetadata<T>(
  key: string,
  target: Type | Object | object,
  metadata: T[],
  propertyKey?: string | symbol
) {
  const existing =
    Reflect.getMetadata(key, target.constructor, propertyKey!) || [];
  const payload = [...existing, ...metadata];

  Reflect.defineMetadata(key, payload, target.constructor, propertyKey!);
}
