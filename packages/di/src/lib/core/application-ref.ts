import { DynamicInjector } from '@di/core/dynamic-injector';
import { Injector, InjectorGetResult } from '@di/core/injector';
import { ModuleContainer } from '@di/core/module-container';
import { ModuleRef } from '@di/core/module-ref';
import { Injectable } from '@di/decorators/injectable.decorator';
import { getInjectableDef } from '@di/providers/injectable-def';
import { Providable } from '@di/providers/injection-token';
import { Type } from '@di/types';
import { isNil } from '@di/utils/common';

@Injectable({ providedIn: "root" })
export abstract class ApplicationRef {
  public get rootInjector(): Injector {
    return this._rootInjector;
  }
  protected _rootInjector: Injector;

  constructor(rootInjector: Injector) {
    (<DynamicInjector>rootInjector).bind({
      provide: ApplicationRef,
      useValue: this,
    });
    this._rootInjector = rootInjector;
  }

  /**
   * Returns an instance of a provider registered in the root- or any
   * module-injector.
   */
  public async get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: Providable,
    module?: Type | ModuleRef
  ): Promise<R> {
    const { providedIn } = getInjectableDef(typeOrToken);

    if (isNil(module) || providedIn === "root") {
      return this.rootInjector.get(typeOrToken);
    }

    let moduleRef: ModuleRef = <ModuleRef>module;

    if (isNil((<ModuleRef>module).injector)) {
      moduleRef = await this.getModuleRef(<Type>module);
    }

    return moduleRef.get(typeOrToken);
  }

  /**
   * Returns the `ModuleRef` for a given module type
   */
  public async getModuleRef(module: Type): Promise<ModuleRef> {
    const moduleContainerRef = await this.rootInjector.get(ModuleContainer);
    const moduleRef = moduleContainerRef.get(module);

    if (isNil(moduleRef)) {
      throw `Could not find module ${module.name}`;
    }

    return moduleRef;
  }
}
