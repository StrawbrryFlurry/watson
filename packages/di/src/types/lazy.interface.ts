export type ILazy<T> = T extends object
  ? { [P in keyof T]: Promise<T[P]> } & HasLazyGetter<T>
  : HasLazyGetter<T>;
type HasLazyGetter<T> = { get: () => Promise<T> };
