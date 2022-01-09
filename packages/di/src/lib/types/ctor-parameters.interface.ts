export type CtorParameters<T extends Object> = T extends new (
  ...args: infer A
) => any
  ? A
  : never;
