import 'reflect-metadata';

import { Injectable, InjectorLifetime } from '@watsonjs/common';
import { ContextInjector, Injector, uuid } from '@watsonjs/core';

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

describe("Dynamic Injector advanced dependency resolution", () => {
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
