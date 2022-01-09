import { ExceptionHandlerImpl, ExceptionHandlerRef } from '@core/lifecycle';
import { RouterRef } from '@core/router';
import { ModuleContainer, ModuleRef } from '@watsonjs/di';

import { HatsModule, HatsRouter } from '../test-application/hats';
import { createTestingModule } from '../test-utils';

describe("All modules and components have an ExceptionHandler", () => {
  let moduleRef: ModuleRef;
  let moduleContainer: ModuleContainer;

  beforeAll(async () => {
    moduleRef = await createTestingModule();
    moduleContainer = await moduleRef.get(ModuleContainer);
  });

  test("Modules have an exception handler", async () => {
    const exceptionHandler = await moduleRef.get(ExceptionHandlerRef);
    expect(exceptionHandler).toBeInstanceOf(ExceptionHandlerImpl);
  });

  test("Routers have an exception handler", async () => {
    const hatsModuleRef = moduleContainer.get(HatsModule)!;
    const hatsRouterRef = await hatsModuleRef.get<RouterRef>(HatsRouter);
    const exceptionHandler = await hatsRouterRef.get(ExceptionHandlerRef);
    expect(exceptionHandler).toBeInstanceOf(ExceptionHandlerImpl);
  });
});
