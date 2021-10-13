import { ModuleRef } from '@di';
import { DIProvided, Type } from '@watsonjs/common';

export class ModuleContainer extends DIProvided({ providedIn: "root" }) {
  public modules = new Map<Type, ModuleRef>();

  public apply(module: ModuleRef) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }

  public get(module: Type): ModuleRef | null {
    return this.modules.get(module) ?? null;
  }
}
