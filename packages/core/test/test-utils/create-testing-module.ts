import { Injector, ModuleLoader, ModuleRef } from '@watsonjs/di';

import { AppModule } from '../test-application';

export function createTestingModule(): Promise<ModuleRef> {
  const injector = Injector.create([]);
  const moduleLoader = new ModuleLoader(injector);
  return moduleLoader.resolveRootModule(AppModule);
}
