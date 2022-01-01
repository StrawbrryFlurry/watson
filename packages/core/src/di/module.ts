import { RouterRefImpl } from '@core/di';
import { DeclareModuleRef, Injector, ModuleDef, ModuleRef, Type } from '@watsonjs/di';

@DeclareModuleRef()
export class ModuleImpl<T extends object = Type> extends ModuleRef<T> {
  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super(metatype, rootInjector, parent, moduleDef, RouterRefImpl);
  }
}
