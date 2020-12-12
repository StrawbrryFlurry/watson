import { TInjectable, TReceiver, Type } from '@watson/common';

import { InstanceWrapper } from './instance-wrapper';

/**
 * Wrapper for a class decorated with the @\Module decorator.
 * Resolves providers and imports for other dependants
 *
 */
export class Module {
  private readonly _id: string;
  private readonly _imports = new Set<Module>();
  private readonly _exports = new Set<Module>();
  private readonly _receivers = new Map<any, InstanceWrapper<TReceiver>>();
  private readonly _injectables = new Map<any, InstanceWrapper<TInjectable>>();

  private readonly baseModule: InstanceWrapper<Type>;

  constructor(module: InstanceWrapper<Type>) {
    this.baseModule = module;

    this.initProperties();
  }

  initProperties() {}
}
