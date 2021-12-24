import { Injectable } from '@di/decorators';
import { Type } from '@di/types';

import type { ModuleRef } from "@di/core/module-ref";

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
