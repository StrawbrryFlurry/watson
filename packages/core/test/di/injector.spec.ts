import 'reflect-metadata';

import { Injectable, InjectionToken, ValueProvider } from '@watsonjs/common';
import { Injector } from '@watsonjs/core';

describe("Basic injector test", () => {
  @Injectable()
  class Foo {}

  @Injectable()
  class DependsOnFoo {
    constructor(public foo: Foo) {}
  }

  const DATABASE_URL = new InjectionToken<string>(
    "Some arbitrary provider token",
    { providedIn: "module" }
  );

  const ROOT_DB_URL = "ROOT";
  const rootInjector = Injector.create([
    {
      provide: DATABASE_URL,
      useValue: ROOT_DB_URL,
    } as ValueProvider,
  ]);

  test("Create instance with static dependency", async () => {
    const inj = Injector.create([Foo, DependsOnFoo]);
    const instance = await inj.get(DependsOnFoo);

    expect(instance).toBeInstanceOf(DependsOnFoo);
    expect(instance.foo).toBeInstanceOf(Foo);
  });

  test("Fail resolution from parent for module scoped providers", async () => {
    const inj = Injector.create([], rootInjector, Injector);

    try {
      await inj.get(DATABASE_URL);
      fail("Expected to get a NullInjector error");
    } catch (err) {
      console.log(err);
    }
  });
});
