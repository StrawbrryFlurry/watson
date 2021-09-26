import { Module } from '@di';
import { InjectorElementId, Type, WATSON_ELEMENT_ID } from '@watsonjs/common';

export class ModuleContainer {
  public modules = new Map<Type, Module>();

  public apply(module: Module) {
    const { metatype } = module;

    this.modules.set(metatype, module);
  }

  static [WATSON_ELEMENT_ID] = InjectorElementId.Root;
}
