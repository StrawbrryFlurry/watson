export function applyStackableMetadata<T>(
  key: string,
  metadata: T[],
  target: any
) {
  const existing = Reflect.getMetadata(key, target) || [];
  const payload = [...existing, ...metadata];

  Reflect.defineMetadata(key, payload, target);
}
