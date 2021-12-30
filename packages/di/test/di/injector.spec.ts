import 'reflect-metadata';

import { ComponentRef } from '@di/core/component-ref';
import { Injector } from '@di/core/injector';
import { Injectable } from '@di/decorators/injectable.decorator';
import { FactoryProvider, ValueProvider } from '@di/providers/custom-provider.interface';
import { InjectionToken } from '@di/providers/injection-token';
import { TestLogger } from 'packages/di/test/shared/test-logger';

@Injectable()
class NoopLogger {
  constructor(public logger: TestLogger) {}
}

describe("Basic injector test", () => {
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
    const inj = Injector.create([NoopLogger, TestLogger]);
    const noopLogger = await inj.get(NoopLogger);

    expect(noopLogger).toBeInstanceOf(NoopLogger);
    expect(noopLogger.logger).toBeInstanceOf(TestLogger);
  });

  test("Fail resolution from parent for module scoped providers", async () => {
    // We check for module / component level providers by using this provider
    const inj = Injector.create([ComponentRef], rootInjector, Injector);
    expect.assertions(1);

    try {
      await inj.get(DATABASE_URL);
    } catch (err) {
      expect(err).toBeTruthy();
    }
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
