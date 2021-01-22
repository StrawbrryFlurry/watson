import { Inject, Injectable } from '@watsonjs/common';
import { Module } from '@watsonjs/core';
import iterate from 'iterare';

@Injectable()
export class ModuleService {
  constructor(@Inject("MODULE") private module: Module) {}

  public getModuleInjectables() {
    return iterate(this.module.injectables).map(
      ([type, wrapper]) => wrapper.instance
    );
  }
}
