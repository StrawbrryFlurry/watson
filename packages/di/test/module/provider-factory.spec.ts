import 'reflect-metadata';

import { Injector } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleLoader } from '@di/core/module-loader';
import { ModuleRef } from '@di/core/module-ref';
import { ProviderFactoryResolver } from '@di/core/provider-factory-resolver';

import { AppModule } from './app.module';
import { FooModule } from './features';

class ProviderWithoutDependencies {}

class ProviderWithComponentDependency {}

class ProviderWithModuleDependency {}

class ProviderWithContextDependency {}

describe("Proivder Factory tests", () => {
  const rootInjector = Injector.create([]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let moduleContainerRef: ModuleContainer;
  let fooModuleRef: ModuleRef<FooModule>;

  let fooProviderFactory: ProviderFactoryResolver;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(AppModule);
    moduleContainerRef = await rootModuleRef.get(ModuleContainer);
    fooModuleRef = moduleContainerRef.get(FooModule)!;
    fooProviderFactory = await fooModuleRef.get(ProviderFactoryResolver);
  });

  test("Create instance of unknown type provider", async () => {
    const providerFactory = await fooProviderFactory.resolve(
      ProviderWithoutDependencies,
      null
    );
    const instance = await providerFactory.create();
    expect(instance).toBeInstanceOf(ProviderWithoutDependencies);
  });
});
