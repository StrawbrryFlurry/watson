import 'reflect-metadata';

import { ContextInjector, uuid } from '@watsonjs/core';
import { Injectable, Injector, InjectorInquirerContext, InjectorLifetime } from '@watsonjs/di';

class TestLifetimeProvider {
  public id: string;
  constructor() {
    this.id = uuid();
  }
}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
class TransientProvided extends TestLifetimeProvider {}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Singleton })
class SingletonProvider extends TestLifetimeProvider {}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Event })
class EventProvider extends TestLifetimeProvider {}

@Injectable({ lifetime: InjectorLifetime.Transient })
class NoopLogger {
  public name: string;

  constructor(inquirerCtx: InjectorInquirerContext) {
    const { inquirer } = inquirerCtx;

    if (inquirer === Injector) {
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

  test("Event providers create a new instance for every ExecutionContext.", async () => {
    const inj = Injector.create([EventProvider], null, Injector.NULL);
    const noopPipeline = <any>{ router: null };
    const ctxa = new ContextInjector(inj, noopPipeline, () => {});
    const ctxb = new ContextInjector(inj, noopPipeline, () => {});

    const a = await inj.get(EventProvider, null, ctxa);
    const a2 = await inj.get(EventProvider, null, ctxa);
    const b = await inj.get(EventProvider, null, ctxb);

    expect(a.id).toEqual(a2.id);
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
