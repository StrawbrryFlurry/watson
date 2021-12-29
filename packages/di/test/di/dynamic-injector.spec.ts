import 'reflect-metadata';

import { Injector } from '@di/core/injector';
import { InjectorInquirerContext, REQUESTED_BY_INJECTOR } from '@di/core/inquirer-context';
import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime } from '@di/providers/injection-token';
import { randomUUID } from 'crypto';

class TestLifetimeProvider {
  public id: string;
  constructor() {
    this.id = randomUUID();
  }
}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
class TransientProvided extends TestLifetimeProvider {}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Singleton })
class SingletonProvider extends TestLifetimeProvider {}

@Injectable({ lifetime: InjectorLifetime.Transient })
class NoopLogger {
  public name: string;

  constructor(inquirerCtx: InjectorInquirerContext) {
    const { inquirer } = inquirerCtx;

    if (inquirer === REQUESTED_BY_INJECTOR) {
      this.name = "[GLOBAL]";
    } else {
      this.name = inquirer.name;
    }
  }
}

@Injectable()
class NeedsLogger {
  constructor(public logger: NoopLogger) {}
}

describe("[Dynamic Injector] Injector Lifetimes", () => {
  test("Singleton providers keep the same instance throughout module scopes.", async () => {
    const inja = Injector.create([SingletonProvider], null, Injector.NULL);
    const injb = Injector.create([SingletonProvider], null, Injector.NULL);
    const a = await inja.get(SingletonProvider);
    const b = await injb.get(SingletonProvider);
    expect(a.id).toEqual(b.id);
  });

  test("Transient providers create a new instance every time.", async () => {
    const inj = Injector.create([TransientProvided], null, Injector.NULL);
    const a = await inj.get(TransientProvided);
    const b = await inj.get(TransientProvided);
    expect(a.id).not.toEqual(b.id);
  });
});

describe("[Dynamic Injector] Internals", () => {
  const inj = Injector.create([NeedsLogger, NoopLogger]);

  test("The injector keeps track of it's history by using the InjectorInquirerContext", async () => {
    const logClient = await inj.get(NeedsLogger);
    expect(logClient.logger.name).toEqual(NeedsLogger.name);
  });

  test("Resolved providers from the injector without an intermediate dependency get the `Injector` type as inquirer", async () => {
    const logger = await inj.get(NoopLogger);
    expect(logger.name).toEqual("[GLOBAL]");
  });
});
