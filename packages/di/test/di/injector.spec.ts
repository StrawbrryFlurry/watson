import 'reflect-metadata';

import { ComponentRef } from '@di/core/component-ref';
import { Injector } from '@di/core/injector';
import { InquirerContext } from '@di/core/inquirer-context';
import { ModuleRef } from '@di/core/module-ref';
import { Host, Optional, Self, SkipSelf } from '@di/decorators/inject.decorator';
import { Injectable } from '@di/decorators/injectable.decorator';
import { FactoryProvider, ValueProvider } from '@di/providers/custom-provider.interface';
import { InjectionToken } from '@di/providers/injection-token';
import { TestLogger } from 'packages/di/test/shared/test-logger';

@Injectable()
class NoopLogger {
  constructor(public logger: TestLogger) {}
}

@Injectable()
class NoopLoggerOptional {
  constructor(@Optional() public logger: TestLogger) {}
}

@Injectable({ providedIn: "module" })
class NoopLoggerSkipSelf {
  constructor(@SkipSelf() public logger: TestLogger) {}
}

@Injectable({ providedIn: "module" })
class NoopLoggerSelf {
  constructor(@Self() @Optional() public logger: TestLogger) {}
}

@Injectable({ providedIn: "module" })
class NoopLoggerHost {
  constructor(@Host() public logger: TestLogger) {}
}

const CustomProviderWithInjectFlag: FactoryProvider = {
  provide: NoopLoggerOptional,
  useFactory: (logger: TestLogger) => new NoopLoggerOptional(logger),
  deps: [[[new Optional()], TestLogger]],
};

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
      "Multi provider test",
      { multi: true }
    );
    const PROVIDER_VALUE = "Beep Boop";

    const multiProvider: FactoryProvider = {
      provide: MULTI_PROVIDER_TOKEN,
      useFactory: () => PROVIDER_VALUE,
    };

    const inj = Injector.create([multiProvider, multiProvider], null, Injector);
    const providerInstances = await inj.get(MULTI_PROVIDER_TOKEN);

    expect(providerInstances).toEqual([PROVIDER_VALUE, PROVIDER_VALUE]);
  });
});

describe("Injector inject flags", () => {
  it("Doesn't throw an error when an optional dependency was not found", async () => {
    const inj = Injector.create([NoopLoggerOptional]);
    const noopLoggerOptional = await inj.get(NoopLoggerOptional);

    expect(noopLoggerOptional).toBeInstanceOf(NoopLoggerOptional);
    expect(noopLoggerOptional.logger).toBeNull();
  });

  it("Skips it's own injection scope with SkipSelf flag", async () => {
    const parent = Injector.create([TestLogger]);
    const inj = Injector.create([NoopLoggerSkipSelf], parent);
    const noopLoggerSkipSelf = await inj.get(NoopLoggerSkipSelf);

    expect(noopLoggerSkipSelf).toBeInstanceOf(NoopLoggerSkipSelf);
    expect(noopLoggerSkipSelf.logger).not.toBeNull();
  });

  it("Sets the NullInjector as the parent with the Self flag", async () => {
    const parent = Injector.create([TestLogger]);
    const inj = Injector.create([NoopLoggerSelf], parent);

    expect.assertions(1);

    const noop = await inj.get(NoopLoggerSelf);
    expect(noop.logger).toBeNull();
  });

  it("Uses the module injector when the Host flag is set", async () => {
    const moduleTestLogger = new TestLogger(
      new InquirerContext(NoopLoggerHost)
    );

    const testModuleProvider = <ValueProvider>{
      provide: ModuleRef,
      useValue: Injector.create([
        { provide: TestLogger, useValue: moduleTestLogger },
      ]),
    };
    const testModule = Injector.create([testModuleProvider]);
    const parent = Injector.create([TestLogger], testModule);
    const inj = Injector.create([NoopLoggerHost], parent);
    const noopLoggerHost = await inj.get(NoopLoggerHost);

    expect(noopLoggerHost).toBeInstanceOf(NoopLoggerHost);
    expect(noopLoggerHost.logger).toBe(moduleTestLogger);
  });

  it("Works with inject flags used in custom providers", async () => {
    const inj = Injector.create([CustomProviderWithInjectFlag]);
    const noopLoggerOptional = await inj.get(NoopLoggerOptional);

    expect(noopLoggerOptional).toBeInstanceOf(NoopLoggerOptional);
    expect(noopLoggerOptional.logger).toBeNull();
  });
});
