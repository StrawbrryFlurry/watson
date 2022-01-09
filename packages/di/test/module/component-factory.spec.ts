import 'reflect-metadata';

import { Injector } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleLoader } from '@di/core/module-loader';
import { ModuleRef } from '@di/core/module-ref';
import { ValueProvider } from '@di/providers/custom-provider.interface';
import { InjectorLifetime } from '@di/providers/injection-token';

import { ContextInjector } from '../../test/test-utils';
import { AppModule } from './app.module';
import {
  CONTEXT_PROVIDER,
  ContextComponent,
  ContextModule,
  DependsOnFooModule,
  FooComponent,
  FooModule,
  TransientComponent,
  TransientModule,
} from './features';

describe("Component Factory basics", () => {
  const rootInjector = Injector.create([]);
  const moduleLoader = new ModuleLoader(rootInjector);

  let rootModuleRef: ModuleRef;
  let moduleContainerRef: ModuleContainer;
  let fooModuleRef: ModuleRef<FooModule>;
  let transientModuleRef: ModuleRef<TransientModule>;
  let contextModuleRef: ModuleRef<ContextModule>;

  beforeAll(async () => {
    rootModuleRef = await moduleLoader.resolveRootModule(AppModule);
    moduleContainerRef = await rootModuleRef.get(ModuleContainer);
    fooModuleRef = moduleContainerRef.get(FooModule)!;
    transientModuleRef = moduleContainerRef.get(TransientModule)!;
    contextModuleRef = moduleContainerRef.get(ContextModule)!;
  });

  test("Component Factory creates instance of component", async () => {
    const fooCompFac = await fooModuleRef.componentFactoryResolver.resolve(
      FooComponent
    );

    const fooInstance = await fooCompFac.create();
    expect(fooInstance).toBeInstanceOf(FooComponent);
  });

  test("Component Factory creates instance with custom moduleRef", async () => {
    const moduleRef = moduleContainerRef.get(DependsOnFooModule)!;
    const fooCompFac = await moduleRef.componentFactoryResolver.resolve(
      FooComponent,
      fooModuleRef
    );

    const fooInstance = await fooCompFac.create();
    expect(fooInstance).toBeInstanceOf(FooComponent);
  });

  test("Factory lifetime is set according to component dependencies", async () => {
    const fooCompFac = await fooModuleRef.componentFactoryResolver.resolve(
      FooComponent
    );
    const transientCompFac =
      await transientModuleRef.componentFactoryResolver.resolve(
        TransientComponent
      );

    expect(fooCompFac.bindingRef.lifetime).toBe(InjectorLifetime.Scoped);
    expect(transientCompFac.bindingRef.lifetime).toBe(
      InjectorLifetime.Transient
    );
  });

  test("Factory instances are provided from cache depending on the context", async () => {
    const ContextProvider: ValueProvider = {
      provide: CONTEXT_PROVIDER,
      useValue: "Hey :3",
    };

    const context1 = new ContextInjector([ContextProvider]);
    const context2 = new ContextInjector([ContextProvider]);

    const fooComp1_1 = await fooModuleRef.createComponent(
      FooComponent,
      context1
    );
    const fooComp1_2 = await fooModuleRef.createComponent(
      FooComponent,
      context1
    );
    const fooComp2 = await fooModuleRef.createComponent(FooComponent, context2);

    expect(fooComp1_1).toBe(fooComp1_2);
    expect(fooComp1_1).toBe(fooComp2);
    expect(fooComp1_2).toBe(fooComp2);

    const transientComp1_1 = await transientModuleRef.createComponent(
      TransientComponent,
      context1
    );
    const transientComp1_2 = await transientModuleRef.createComponent(
      TransientComponent,
      context1
    );
    const transientComp2 = await transientModuleRef.createComponent(
      TransientComponent,
      context2
    );

    expect(transientComp1_1).not.toBe(transientComp1_2);
    expect(transientComp1_1).not.toBe(transientComp2);
    expect(transientComp1_2).not.toBe(transientComp2);

    const contextComp1_1 = await contextModuleRef.createComponent(
      ContextComponent,
      context1
    );
    const contextComp1_2 = await contextModuleRef.createComponent(
      ContextComponent,
      context1
    );
    const contextComp2 = await contextModuleRef.createComponent(
      ContextComponent,
      context2
    );

    expect(contextComp1_1).toBe(contextComp1_2);
    expect(transientComp1_1).not.toBe(contextComp2);
    expect(transientComp1_2).not.toBe(contextComp2);
  });
});
