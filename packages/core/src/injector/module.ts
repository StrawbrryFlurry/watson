import { CustomProvider, isFunction, isString, TInjectable, TReceiver, Type } from '@watson/common';
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
  private readonly _metatype: Type;

  constructor(metatype: Type, container: WatsonContainer) {
    this._id = v4();
    this._metatype = metatype;
    this.container = container;
    this.name = this.metatype.name;

    this.registerDefaultProviders();
  }

  initProperties() {}

  public addImport(module: Module) {
    if (this.imports.has(module)) {
      return;
    }

    this._imports.add(module);
  }

  public addExportedProvider(provider: string | Type<TInjectable>) {
    if (isString(provider)) {
      if (!this.exports.has(provider as string)) {
        this._exports.add(provider as string);
      }
    }

    if (isFunction(provider)) {
      this._exports.add(this.validateExportedProvider((provider as Type).name));
    }
  }

  public addExportedModule(moduleRef: Module) {
    const { providers } = moduleRef;

    for (const [token, wrapper] of providers.entries()) {
      if (!this.exports.has(token)) {
        this._exports.add(token);
      }
    }
  }

  private validateExportedProvider(token: string): string {
    if (!this.providers.has(token)) {
      const { name } = this.metatype;
      throw new UnknownExportException("InstanceLoader", token, name);
    }

    return token;
  }

  public addReceiver(receiver: Type) {
    this._receivers.set(
      receiver.name,
      new InstanceWrapper<TReceiver>({
        name: receiver.name,
        metatype: receiver,
        host: this,
      })
    );
  }

  public addInjectable(injectable: Type) {
    const instanceWrapper = new InstanceWrapper<TInjectable>({
      name: injectable.name,
      metatype: injectable,
      host: this,
    });

    this._injectables.set(injectable.name, instanceWrapper);
    this._providers.set(injectable.name, instanceWrapper);
  }

  public addProvider(provider: Type | CustomProvider) {
    const isCustomProvider = this.isCustomProvider(provider as CustomProvider);

    if (isCustomProvider) {
      return this.addCustomProvider(provider as CustomProvider);
    }

    this.addInjectable(provider as Type);
  }

  private addCustomProvider(provider: CustomProvider) {
    if (this.isClassProvider(provider)) {
      return this.addCalssProvider(provider);
    } else if (this.isValueProvider(provider)) {
      return this.addValueProvider(provider);
    } else if (this.isFactoryProvider(provider)) {
      return this.addFactoryProvider(provider);
    }
  }

  private addFactoryProvider(provider: CustomProvider) {
    const { provide, useFactory, inject, useValue } = provider;

    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        name: provide,
        metatype: useFactory,
        host: this,
        inject,
      })
    );
  }

  private addValueProvider(provider: CustomProvider) {
    const { provide, useValue } = provider;

    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        name: provide,
        metatype: useValue,
        host: this,
        instance: useValue,
        isResolved: true,
      })
    );
  }

  private addCalssProvider(provider: CustomProvider) {
    const { provide, useClass, inject } = provider;

    this._providers.set(
      provider.provide,
      new InstanceWrapper({
        name: provide,
        metatype: useClass,
        host: this,
        inject,
      })
    );
  }

  private isClassProvider(provider: CustomProvider) {
    return provider && "useClass" in provider;
  }

  private isFactoryProvider(provider: CustomProvider) {
    return provider && "useFactory" in provider;
  }

  private isValueProvider(provider: CustomProvider) {
    return provider && "useValue" in provider;
  }

  private isCustomProvider(provider: CustomProvider) {
    return provider && "provide" in provider;
  }

  private registerDefaultProviders() {
    this.providers.set(
      WATSON_CONTAINER_PROVIDER,
      new InstanceWrapper({
        name: "CONTAINER",
        host: this,
        metatype: null,
        instance: this.container,
        isResolved: true,
      })
    );

    this.providers.set(
      CLIENT_ADAPTER_PROVIDER,
      new InstanceWrapper({
        name: "ADAPTER",
        host: this,
        metatype: null,
        instance: this.container.config.clientAdapter,
        isResolved: true,
      })
    );

    this.providers.set(
      CURRENT_MODULE_PROVIDER,
      new InstanceWrapper({
        name: "MODULE",
        metatype: null,
        instance: this,
        host: this,
        isResolved: true,
      })
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
