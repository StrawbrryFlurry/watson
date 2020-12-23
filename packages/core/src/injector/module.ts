import { TInjectable, TReceiver, Type } from '@watson/common';
import { isFunction, isString } from '@watson/common/dist/utils';
import { v4 } from 'uuid';

import { CLIENT_ADAPTER_PROVIDER, CURRENT_MODULE_PROVIDER, WATSON_CONTAINER_PROVIDER } from '../constants';
import { UnknownExportException } from '../exceptions';
import { WatsonContainer } from '../watson-container';
import { InstanceWrapper } from './instance-wrapper';

/**
 * Wrapper for a class decorated with the @\Module decorator.
 * Resolves providers and imports for other dependants
 *
 */
export class Module {
  private readonly _id: string;
  private readonly _imports = new Set<Module>();
  /**
   * This set contains the names of all providers exported by the module
   */
  private readonly _exports = new Set<string>();
  private readonly _receivers = new Map<any, InstanceWrapper<TReceiver>>();
  /**
   * Injectables are services that can be injected during the instance creation of a controller, service and such.
   */
  private readonly _injectables = new Map<any, InstanceWrapper<TInjectable>>();
  /**
   * Providers are a map of InstanceWrappers that can be used by the injector to inject parameters for methods and or construcotrs.
   */
  private readonly _providers = new Map<any, InstanceWrapper<TInjectable>>();
  public readonly name: string;

  private container: WatsonContainer;
  private commands: any;

  private readonly _metatype: Type;

  constructor(metatype: Type, container: WatsonContainer) {
    this._id = v4();
    this._metatype = metatype;
    this.container = container;
    this.name = this.metatype.name;

    this.registerDefaultProviders();
  }

  initProperties() {}

  addImport(module: Module) {
    if (this.imports.has(module)) {
      return;
    }

    this.imports.add(module);
  }

  addExportedProvider(provider: String | Type<TInjectable>) {
    if (isString(provider)) {
      if (!this.exports.has(provider as string)) {
        this.exports.add(provider);
      }
    }

    if (isFunction(provider)) {
      this.exports.add(this.validateExportedProvider((provider as Type).name));
    }
  }

  addExportedModule(moduleRef: Module) {
    const { providers } = moduleRef;

    for (const [token, wrapper] of providers.entries()) {
      if (!this.exports.has(token)) {
        this.exports.add(token);
      }
    }
  }

  validateExportedProvider(token: string): string {
    if (!this.providers.has(token)) {
      const { name } = this.metatype;
      throw new UnknownExportException("InstanceLoader", token, name);
    }

    return token;
  }

  addReceiver(receiver: Type) {
    this.receivers.set(
      receiver.name,
      new InstanceWrapper<TReceiver>(receiver.name, receiver, this, null, false)
    );
  }

  addInjectable(injectable: Type) {
    const instanceWrapper = new InstanceWrapper<TInjectable>(
      injectable.name,
      injectable,
      this,
      null,
      false
    );

    this._injectables.set(injectable.name, instanceWrapper);
    this._providers.set(injectable.name, instanceWrapper);
  }

  private registerDefaultProviders() {
    this.providers.set(
      WATSON_CONTAINER_PROVIDER,
      new InstanceWrapper("CONTAINER", null, this, this.container, true)
    );

    this.providers.set(
      CLIENT_ADAPTER_PROVIDER,
      new InstanceWrapper(
        "ADAPTER",
        null,
        this,
        this.container.getClient(),
        true
      )
    );

    this.providers.set(
      CURRENT_MODULE_PROVIDER,
      new InstanceWrapper("MODULE", this.metatype, this, this, true)
    );
  }

  get metatype(): Type {
    return this._metatype;
  }

  get providers(): Map<any, InstanceWrapper<TInjectable>> {
    return this._providers;
  }

  get injectables(): Map<any, InstanceWrapper<TInjectable>> {
    return this._injectables;
  }

  get receivers(): Map<any, InstanceWrapper<TReceiver>> {
    return this._receivers;
  }

  get imports(): Set<Module> {
    return this._imports;
  }

  get exports(): Set<string | Symbol> {
    return this._exports;
  }
}
