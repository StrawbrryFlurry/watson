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
