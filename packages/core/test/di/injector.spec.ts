import 'reflect-metadata';

import { FactoryProvider, Injectable, InjectionToken, ValueProvider } from '@watsonjs/common';
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
    } catch (err) {}
  });

  test("Multi providers create instances for each provider", async () => {
    const MULTI_PROVIDER_TOKEN = new InjectionToken<string[]>(
      "Multi provider test"
    );
    const PROVIDER_VALUE = "Beep Boop";

    const multiProvider: FactoryProvider = {
      provide: MULTI_PROVIDER_TOKEN,
      useFactory: () => PROVIDER_VALUE,
      multi: true,
    };

    const inj = Injector.create([multiProvider, multiProvider], null, Injector);
    const providerInstances = await inj.get(MULTI_PROVIDER_TOKEN);
    expect(providerInstances).toEqual([PROVIDER_VALUE, PROVIDER_VALUE]);
  });
});
