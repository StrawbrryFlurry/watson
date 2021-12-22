import { ContextInjector, uuid } from "@watsonjs/core";
import { Injectable, Injector, InjectorLifetime } from "@watsonjs/di";

class TestLifetimeProvider {
  public id: string;
  constructor() {
    this.id = uuid();
  }
}

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Event })
class EventProvider extends TestLifetimeProvider {}

describe("Context injector test", () => {
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
