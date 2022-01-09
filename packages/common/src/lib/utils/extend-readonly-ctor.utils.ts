export function ExtendReadonlyCtor<
  T extends { prototype: any },
  C extends { new (): T["prototype"] }
>(klass: T): C {
  return klass as any;
}
