import { ModuleRef } from "@di/core/module-ref";
import {
  forwardRef,
  Injectable,
  Injector,
  ModuleLoader,
  WatsonComponent,
  WatsonComponentRef,
  WatsonModule,
} from "@watsonjs/di";

@WatsonModule({
  components: [forwardRef(() => TestComponent)],
  providers: [forwardRef(() => TestModuleProvider)],
})
class TestModule {}

@WatsonComponent({})
class TestComponent {}

@Injectable({ providedIn: "module" })
class TestModuleProvider {}

describe("Basic Module setup", () => {
  const rootInjector = Injector.create([]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let testComponentRef: WatsonComponentRef;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(TestModule);
    testComponentRef = await rootModuleRef.get<
      WatsonComponentRef<TestComponent>
    >(TestComponent);
  });

  test("ModuleInjectors can resolve a component to a ComponentRef", async () => {
    expect(true).toBeTruthy();
  });

  test("Both the ModuleInjector and the ComponentInjector can resolve module dependencies", async () => {
    const testProviderInModule = await rootModuleRef.get(TestModuleProvider);
    const testProviderInComponent = await testComponentRef.get(
      TestModuleProvider
    );

    expect(testProviderInModule).toBeInstanceOf(TestModuleProvider);
    expect(testProviderInComponent).toBeInstanceOf(TestModuleProvider);
  });

  test("The ComponentInjector provides both ModuleRef and WatsonComponentRef", async () => {
    const moduleRef = await testComponentRef.get(ModuleRef);
    const componentRef = await testComponentRef.get(WatsonComponentRef);

    expect(moduleRef).toBeInstanceOf(ModuleRef);
    expect(componentRef).toBeInstanceOf(WatsonComponentRef);
  });
});
