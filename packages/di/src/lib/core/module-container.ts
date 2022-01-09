import { Injectable } from '@di/decorators/injectable.decorator';
import { Type } from '@di/types';

import type { ModuleRef } from "@di/core/module-ref";

/**
 * Helper type to keep track of all modules
 * that were loaded through the `ModuleLoader`
 * within this application. Can be used to
 * retrieve any `ModuleRef` registered in
 * the application.
 */
@Injectable({ providedIn: "root" })
export class ModuleContainer {
  public modules = new Map<Type, ModuleRef>();

  public apply(module: ModuleRef) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }

  public get<T extends Type>(module: T): ModuleRef<T> | null {
    return this.modules.get(module) ?? null;
  }
}
