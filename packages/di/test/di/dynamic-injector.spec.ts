import 'reflect-metadata';

import { Injector } from '@di/core/injector';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime } from '@di/providers/injection-token';
import { randomUUID } from 'crypto';

import { TestLogger } from '../shared/test-logger';

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

describe("[Dynamic Injector] Internals", () => {
  const inj = Injector.create([NeedsLogger, TestLogger]);

  test("The injector keeps track of it's history by using the InjectorInquirerContext", async () => {
    const logClient = await inj.get(NeedsLogger);
    expect(logClient.logger.name).toEqual(NeedsLogger.name);
  });

  test("Resolved providers from the injector without an intermediate dependency get the `REQUESTED_BY_INJECTOR` type as inquirer", async () => {
    const logger = await inj.get(TestLogger);
    expect(logger.name).toEqual("[GLOBAL]");
  });
});
