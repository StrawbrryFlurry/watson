import { ClassProvider, createBinding, Injector, InjectorLifetime, WATSON_BINDING_DEF } from '..';

describe("It can create dependencies", () => {
  test("A is A", async () => {
    class A {
      static [WATSON_BINDING_DEF] = createBinding({
        provide: A,
        useClass: A,
        scope: InjectorLifetime.Singleton,
      } as ClassProvider);
    }

    const injector = Injector.create([A]);
    const a = injector.get(A);
    expect(a).toBeInstanceOf(A);
  });
});
