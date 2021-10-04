import { ModuleDef } from "@di";
import { DIProvided, Type } from "@watsonjs/common";

export class ModuleContainer extends DIProvided({ providedIn: "root" }) {
  public modules = new Map<Type, ModuleDef>();

  public apply(module: ModuleDef) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }
}
