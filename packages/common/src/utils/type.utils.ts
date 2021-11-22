export type ArgumentsOf<T extends Function> = T extends (
  ...args: infer A
) => any
  ? A
  : never;

export type OmitFirstElement<T extends Array<any>> = T extends [
  infer _,
  ...infer R
]
  ? R
  : never;

export type FunctionPropertiesOfType<T extends {}> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type IsLowerCase<T extends string> = T extends Lowercase<T>
  ? true
  : false;

export type ValueOrNever<T extends boolean, R> = T extends true ? R : never;

export type ToCharArray<
  T extends string,
  R extends string[] = []
> = T extends `${infer F}${infer L}` ? ToCharArray<L, [...R, F]> : R;

export type StringHasLength<
  T extends string,
  L extends number
> = ToCharArray<T>[L] extends undefined | never ? true : false;

export type And<R extends boolean[], T extends boolean = true> = T extends false
  ? false
  : R extends [infer I, ...infer NR]
  ? I extends boolean
    ? NR extends boolean[]
      ? And<NR, I>
      : true
    : true
  : true;

export type CtorParameters<T extends Object> = T extends new (
  ...args: infer A
) => any
  ? A
  : never;
