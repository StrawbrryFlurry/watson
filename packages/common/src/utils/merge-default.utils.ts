export function mergeDefaults<T>(value: Partial<T>, defaults: T): T {
  return { ...defaults, ...value };
}
