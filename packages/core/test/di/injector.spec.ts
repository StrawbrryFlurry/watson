import { Injector } from '@watsonjs/core';

describe("It can create dependencies", () => {
  test("A is A", async () => {
    class A {}

    const injector = Injector.create([A]);
    const a = injector.get(A);
    expect(a).toBeInstanceOf(A);
  });
});
