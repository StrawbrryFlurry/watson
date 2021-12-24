import 'reflect-metadata';

import { WatsonComponentRef } from '@di/core/component-ref';
import { Injector } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleLoader } from '@di/core/module-loader';
import { ModuleRef } from '@di/core/module-ref';
import { Injectable, WatsonComponent, WatsonModule } from '@di/decorators';
import { forwardRef, WatsonDynamicModule } from '@di/providers';

@Injectable({ providedIn: "module" })
class NoopLogger {}

class TestDynamicModule {
  static async create(): Promise<WatsonDynamicModule> {
    return {
      module: TestDynamicModule,
      providers: [{ provide: NoopLogger, useClass: NoopLogger }],
    };
  }
}

@WatsonModule({
  imports: [TestDynamicModule.create()],
  components: [forwardRef(() => TestComponent)],
  providers: [forwardRef(() => TestModuleProvider)],
})
class TestModule {}

@WatsonComponent({})
class TestComponent {}

@Injectable({ providedIn: "module" })
class TestModuleProvider {}

describe("Basic Module setup", () => {
  const rootInjector = Injector.create([
    { provide: ModuleContainer, useClass: ModuleContainer },
  ]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let testComponentRef: WatsonComponentRef;
  let moduleContainerRef: ModuleContainer;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(TestModule);
    testComponentRef = await rootModuleRef.get<
      WatsonComponentRef<TestComponent>
    >(TestComponent);
    moduleContainerRef = await rootInjector.get(ModuleContainer);
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

  test("Dynamic modules are added to the module tree", async () => {
    const dynamicModuleRef = moduleContainerRef.get(TestDynamicModule);
    expect(dynamicModuleRef).toBeInstanceOf(ModuleRef);
  });

  test("Dynamic modules behave like regular modules", async () => {
    const dynamicModuleRef = moduleContainerRef.get(TestDynamicModule)!;
    const logger = await dynamicModuleRef.get(NoopLogger);
    expect(logger).toBeInstanceOf(NoopLogger);
  });
});
