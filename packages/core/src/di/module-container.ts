import { ModuleRef } from '@core/di';
import { Injectable, Type } from '@watsonjs/common';

@Injectable({ providedIn: "root" })
export class ModuleContainer {
  public modules = new Map<Type, ModuleRef>();

  public apply(module: ModuleRef) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }

  public get(module: Type): ModuleRef | null {
    return this.modules.get(module) ?? null;
  }
}
