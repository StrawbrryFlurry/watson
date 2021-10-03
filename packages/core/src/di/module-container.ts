import { Module } from '@di';
import { DIProvided, Type } from '@watsonjs/common';

export class ModuleContainer extends DIProvided({ providedIn: "root" }) {
  public modules = new Map<Type, Module>();

  public apply(module: Module) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }
}
