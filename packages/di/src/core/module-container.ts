import { ModuleRef } from "@di/core/module-ref";
import { Injectable } from "@di/decorators";
import { Type } from "@di/types";

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
