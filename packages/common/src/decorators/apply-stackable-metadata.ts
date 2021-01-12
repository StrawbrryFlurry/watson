export function applyStackableMetadata<T>(
  key: string,
  metadata: T[],
  target: Function
) {
  const existing = Reflect.getMetadata(key, target) || [];
  const payload = [...existing, ...metadata];

  Reflect.defineMetadata(key, payload, target);
}
