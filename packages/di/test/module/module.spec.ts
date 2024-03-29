import 'reflect-metadata';

import { ComponentRef } from '@di/core/component-ref';
import { Injector } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleLoader } from '@di/core/module-loader';
import { ModuleRef } from '@di/core/module-ref';
import { WatsonComponent } from '@di/decorators/component.decorator';
import { Injectable } from '@di/decorators/injectable.decorator';
import { WatsonModule } from '@di/decorators/module.decorator';
import { CustomProvider } from '@di/providers/custom-provider.interface';
import { WatsonDynamicModule } from '@di/providers/dynamic-module.interface';
import { forwardRef } from '@di/providers/forward-ref';
import { InjectionToken } from '@di/providers/injection-token';

import { TestLogger } from '../shared/test-logger';

const PROVIDER_TOKEN = new InjectionToken<string>("Custom Provider");

const CustomProviderWithInjectionToken: CustomProvider = {
  provide: PROVIDER_TOKEN,
  useValue: PROVIDER_TOKEN.name,
};

class TestDynamicModule {
  static async create(): Promise<WatsonDynamicModule> {
    return {
      module: TestDynamicModule,
      imports: [TestNestedDynamicModule.create()],
      providers: [{ provide: TestLogger, useClass: TestLogger }],
      exports: [PROVIDER_TOKEN, TestNestedDynamicModule],
    };
  }
}

class TestNestedDynamicModule {
  static async create(): Promise<WatsonDynamicModule> {
    return {
      module: TestNestedDynamicModule,
      providers: [CustomProviderWithInjectionToken],
      exports: [PROVIDER_TOKEN],
    };
  }
}

@WatsonModule({
  imports: [TestDynamicModule.create()],
  components: [forwardRef(() => TestComponent)],
  providers: [forwardRef(() => TestModuleProvider)],
})
class TestModule {}

@WatsonComponent()
class TestComponent {
  constructor(private _componentRef: ComponentRef) {}
}

@Injectable({ providedIn: "module" })
class TestModuleProvider {}

describe("Basic Module setup", () => {
  const rootInjector = Injector.create([]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let testComponentRef: ComponentRef;
  let moduleContainerRef: ModuleContainer;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(TestModule);
    testComponentRef = await rootModuleRef.get<
      ComponentRef<typeof TestComponent>
    >(TestComponent);
    moduleContainerRef = await rootInjector.get(ModuleContainer);
  });

  test("ModuleInjectors can resolve a component to a ComponentRef", async () => {
    expect(testComponentRef).toBeInstanceOf(ComponentRef);
  });

  test("Both the ModuleInjector and the ComponentInjector can resolve module dependencies", async () => {
    const testProviderInModule = await rootModuleRef.get(TestModuleProvider);
    const testProviderInComponent = await testComponentRef.get(
      TestModuleProvider
    );

    expect(testProviderInModule).toBeInstanceOf(TestModuleProvider);
    expect(testProviderInComponent).toBeInstanceOf(TestModuleProvider);
  });

  test("The ComponentInjector provides both ModuleRef and ComponentRef", async () => {
    const moduleRef = await testComponentRef.get(ModuleRef);
    const componentRef = await testComponentRef.get(ComponentRef);

    expect(moduleRef).toBeInstanceOf(ModuleRef);
    expect(componentRef).toBeInstanceOf(ComponentRef);
  });

  test("Dynamic modules are added to the module tree", async () => {
    const dynamicModuleRef = moduleContainerRef.get(TestDynamicModule);

    expect(dynamicModuleRef).toBeInstanceOf(ModuleRef);
  });

  test("Dynamic modules behave like regular modules", async () => {
    const dynamicModuleRef = moduleContainerRef.get(TestDynamicModule)!;
    const logger = await dynamicModuleRef.get(TestLogger);

    expect(logger).toBeInstanceOf(TestLogger);
  });

  test("Dynamic module exports work with InjectionTokens", async () => {
    const rootModuleRef = moduleContainerRef.get(TestModule)!;
    const exportedProvider = await rootModuleRef.get(PROVIDER_TOKEN);

    expect(exportedProvider).toBe(PROVIDER_TOKEN.name);
  });
});
