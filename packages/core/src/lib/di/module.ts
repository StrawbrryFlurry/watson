import { RouterRefImpl } from '@core/di';
import { WATSON_EXCEPTION_HANDLER_PROVIDER } from '@core/lifecycle';
import { DeclareModuleRef, DynamicInjector, Injector, ModuleDef, ModuleRef, ProviderResolvable, Type } from '@watsonjs/di';

@DeclareModuleRef()
export class ModuleImpl<T extends object = Type> extends ModuleRef<T> {
  constructor(
    metatype: Type,
    rootInjector: Injector,
    parent: Injector,
    moduleDef: ModuleDef
  ) {
    super(metatype, rootInjector, parent, moduleDef, RouterRefImpl);
    const moduleProviders = this._makeWatsonModuleProviders();
    (<DynamicInjector>this.injector).bind(...moduleProviders);
  }

  private _makeWatsonModuleProviders(): ProviderResolvable[] {
    return [WATSON_EXCEPTION_HANDLER_PROVIDER];
  }
}
