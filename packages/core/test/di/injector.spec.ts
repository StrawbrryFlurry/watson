import { Injectable } from '@watsonjs/common';
import { Injector } from '@watsonjs/core';

describe("Basic injector test", () => {
  @Injectable()
  class Foo {}

  @Injectable()
  class DependsOnFoo {
    constructor(public foo: Foo) {}
  }

  test("Create instance with static dependency", async () => {
    const inj = Injector.create([Foo, DependsOnFoo]);
    const instance = await inj.get(DependsOnFoo);

    expect(instance).toBeInstanceOf(DependsOnFoo);
    expect(instance.foo).toBeInstanceOf(Foo);
  });
});
