import 'reflect-metadata';

import { Injector } from '@di/core/injector';
import { InquirerContext } from '@di/core/inquirer-context';
import { Lazy } from '@di/decorators/inject.decorator';
import { Injectable } from '@di/decorators/injectable.decorator';
import { forwardRef } from '@di/providers/forward-ref';
import { InjectorLifetime } from '@di/providers/injection-token';
import { LazyProvided } from '@di/types';
import { randomUUID } from 'crypto';

import { TestLogger } from '../shared';

class TestLifetimeProvider {
  public id: string;
  constructor() {
    this.id = randomUUID();
  }
}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
class TransientProvided extends TestLifetimeProvider {}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Scoped })
class ScopedProvider extends TestLifetimeProvider {}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Singleton })
class SingletonProvider extends TestLifetimeProvider {}

@Injectable()
class NeedsLogger {
  constructor(public readonly logger: TestLogger) {}
}

@Injectable()
class LazyLogger {
  constructor(
    @Lazy(TestLogger) public readonly logger: LazyProvided<TestLogger>
  ) {}
}

@Injectable()
class CircularLoggerA extends TestLogger {
  constructor(
    @Lazy(forwardRef(() => CircularLoggerB))
    public readonly logger: LazyProvided<CircularLoggerB>,
    inquirerCtx: InquirerContext
  ) {
    super(inquirerCtx);
  }
}

@Injectable()
class CircularLoggerB extends TestLogger {
  constructor(
    @Lazy(CircularLoggerA)
    public readonly logger: LazyProvided<CircularLoggerA>,
    inquirerCtx: InquirerContext
  ) {
    super(inquirerCtx);
  }
}

describe("[Dynamic Injector] Injector Lifetimes", () => {
  test("Singleton providers keep the same instance throughout module scopes.", async () => {
    const inj_1 = Injector.create([SingletonProvider]);
    const inj_2 = Injector.create([SingletonProvider]);

    const a = await inj_1.get(SingletonProvider);
    const b = await inj_2.get(SingletonProvider);

    expect(a.id).toEqual(b.id);
  });

  test("Transient providers create a new instance every time.", async () => {
    const inj = Injector.create([TransientProvided]);

    const a = await inj.get(TransientProvided);
    const b = await inj.get(TransientProvided);

    expect(a.id).not.toEqual(b.id);
  });

  test("Scoped providers create a new instance every time.", async () => {
    const scopeInj_1 = Injector.create([ScopedProvider]);
    const scopeInj_2 = Injector.create([ScopedProvider]);

    const a_1 = await scopeInj_1.get(ScopedProvider);
    const a_2 = await scopeInj_1.get(ScopedProvider);
    const b = await scopeInj_2.get(ScopedProvider);

    expect(a_1.id).toEqual(a_2.id);
    expect(a_1.id).not.toEqual(b.id);
  });
});

describe("Lazy loading", () => {
  test("Lazy providers are not resolved until they are requested.", async () => {
    const inj = Injector.create([LazyLogger, TestLogger]);

    const instance = await inj.get(LazyLogger);
    const logger = await instance.logger.get();

    expect(logger.name).toBe("LazyLogger");
    expect(instance.logger.name).toBe("LazyLogger");
  });

  it("Can create providers with circular dependencies when using @Lazy", async () => {
    const inj = Injector.create([CircularLoggerA, CircularLoggerB, TestLogger]);
    const instance = await inj.get(CircularLoggerA);

    const loggerInstB = await instance.logger.get();
    const loggerInstA = await loggerInstB.logger.get();
    const nameOfA = await loggerInstA.logger.name;

    expect(loggerInstB).toBeInstanceOf(CircularLoggerB);
    expect(loggerInstB.logger.name).toBe("CircularLoggerB");
    expect(loggerInstA).toBeInstanceOf(CircularLoggerA);
    expect(nameOfA).toBe("CircularLoggerA");
  });
});

describe("[Dynamic Injector] Internals", () => {
  const inj = Injector.create([NeedsLogger, TestLogger]);

  test("The injector keeps track of it's history by using the InquirerContext", async () => {
    const logClient = await inj.get(NeedsLogger);
    expect(logClient.logger.name).toEqual(NeedsLogger.name);
  });

  test("Resolved providers from the injector without an intermediate dependency get the `REQUESTED_BY_INJECTOR` type as inquirer", async () => {
    const logger = await inj.get(TestLogger);
    expect(logger.name).toEqual("[GLOBAL]");
  });
});
