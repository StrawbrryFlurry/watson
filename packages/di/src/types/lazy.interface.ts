/**
 * Wrapper for any lazy provided value using the
 * `@Lazy` decorator. If the lazy provided value
 * is an object, all it's getters are asynchronous
 * bindings to the instance's properties.
 */
export type LazyProvided<T> = T extends object
  ? { [P in keyof T]: Promise<T[P]> } & HasLazyGetter<T>
  : HasLazyGetter<T>;

type HasLazyGetter<T> = { get: () => Promise<T> };
