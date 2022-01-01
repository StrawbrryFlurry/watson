import 'reflect-metadata';

import { ComponentRef } from '@di/core/component-ref';
import { Injector } from '@di/core/injector';
import { InquirerContext } from '@di/core/inquirer-context';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleLoader } from '@di/core/module-loader';
import { ModuleRef } from '@di/core/module-ref';
import { ProviderFactory } from '@di/core/provider-factory';
import { ProviderFactoryResolver } from '@di/core/provider-factory-resolver';
import { Injectable } from '@di/decorators/injectable.decorator';

import { AppModule } from './app.module';
import { FooComponent, FooModule } from './features';

@Injectable()
class ProviderWithoutDependencies {}

@Injectable()
class ProviderWithComponentDependency {
  constructor(public readonly componentRef: ComponentRef) {}
}

@Injectable()
class ProviderWithModuleDependency {
  constructor(public readonly moduleRef: ModuleRef) {}
}

@Injectable()
class ProviderWithInquirerCtx {
  constructor(public readonly inquirerCtx: InquirerContext) {}
}

class ProviderWithContextDependency {}

describe("Proivder Factory tests", () => {
  const rootInjector = Injector.create([]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let moduleContainerRef: ModuleContainer;
  let fooModuleRef: ModuleRef<FooModule>;
  let fooComponentRef: ComponentRef<FooComponent>;
  let fooProviderFactory: ProviderFactoryResolver;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(AppModule);
    moduleContainerRef = await rootModuleRef.get(ModuleContainer);
    fooModuleRef = moduleContainerRef.get(FooModule)!;
    fooComponentRef = await fooModuleRef.get<ComponentRef<FooComponent>>(
      FooComponent
    );
    fooProviderFactory = await fooModuleRef.get(ProviderFactoryResolver);
  });

  test("Create instance of unknown type provider without deps", async () => {
    const providerFactory = await fooProviderFactory.resolve(
      ProviderWithoutDependencies,
      null
    );
    const instance = await providerFactory.create();
    expect(instance).toBeInstanceOf(ProviderWithoutDependencies);
  });

  test("Create instance with module level dependency", async () => {
    const providerFactory = await fooProviderFactory.resolve(
      ProviderWithModuleDependency,
      null
    );
    const instance = await providerFactory.create();
    expect(instance).toBeInstanceOf(ProviderWithModuleDependency);
    expect(instance.moduleRef).toBe(fooModuleRef);
  });

  test("Create instance with component level dependency", async () => {
    const providerFactory = await fooProviderFactory.resolve(
      ProviderWithComponentDependency,
      null
    );
    const instance = await providerFactory.create(fooComponentRef);
    expect(instance).toBeInstanceOf(ProviderWithComponentDependency);
    expect(instance.componentRef).toBe(fooComponentRef);
  });

  test("Create instance with inquirer context", async () => {
    const providerFactory = await fooProviderFactory.resolve(
      ProviderWithInquirerCtx,
      null
    );
    const instance = await providerFactory.create();
    expect(instance).toBeInstanceOf(ProviderWithInquirerCtx);
    expect(instance.inquirerCtx.inquirer).toBe(ProviderFactory);
  });
});
