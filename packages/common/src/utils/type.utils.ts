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
