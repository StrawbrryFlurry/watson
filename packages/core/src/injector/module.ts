import {
  ClassProvider,
  CustomProvider,
  FactoryProvider,
  isFunction,
  isString,
  TInjectable,
  TReceiver,
  Type,
  ValueProvider,
} from '@watsonjs/common';
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
   * Injectables are services such as guards and filters.
   */
  private readonly _injectables = new Map<any, InstanceWrapper<TInjectable>>();
  /**
   * Providers are a map of InstanceWrappers that can be used by the injector to inject parameters for methods and or construcotrs.
   */
  private readonly _providers = new Map<any, InstanceWrapper<TInjectable>>();
  /**
   * @provisional
   * Contains metadata for components such as receiver events
   * @key metadataKey
   * @value the metadata value
   */
  private readonly _componentMetadata = new Map<string, any>();
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

  public addImport(moduleRef: Module) {
    if (this.imports.has(moduleRef)) {
      return;
    }

    this._imports.add(moduleRef);
  }

  public addExportedProvider(
    provider: string | Type<TInjectable> | CustomProvider
  ) {
    if (isString(provider)) {
      if (!this.exports.has(provider as string)) {
        this._exports.add(provider as string);
      }
    }

    if (this.isCustomProvider(provider as CustomProvider)) {
      const name = this.getCustomProviderName(provider as CustomProvider);
      this._exports.add(name);
    }

    if (isFunction(provider)) {
      this._exports.add(this.validateExportedProvider((provider as Type).name));
    }
  }

  public addExportedModule(moduleRef: Module) {
    if (!this._imports.has(moduleRef) && moduleRef._id !== this._id) {
      throw new UnknownExportException(
        "InstanceLoader",
        moduleRef.name,
        this.name
      );
    }

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
    const wrapper = this._injectables.get(injectable);

    if (!wrapper) {
      const instanceWrapper = new InstanceWrapper<TInjectable>({
        name: injectable.name,
        metatype: injectable,
        host: this,
      });

      this._injectables.set(injectable, instanceWrapper);
    }
  }

  public addProvider(provider: Type | CustomProvider) {
    const isCustomProvider = this.isCustomProvider(provider as CustomProvider);

    if (isCustomProvider) {
      return this.addCustomProvider(provider as CustomProvider);
    }

    const wrapper = this._providers.get(provider);

    if (!wrapper) {
      const instanceWrapper = new InstanceWrapper<TInjectable>({
        name: (provider as Type).name,
        metatype: provider,
        host: this,
      });

      this._providers.set(provider, instanceWrapper);
    }
  }

  private addCustomProvider(provider: CustomProvider) {
    if (this.isClassProvider(provider)) {
      return this.addCalssProvider(provider as ClassProvider);
    } else if (this.isValueProvider(provider)) {
      return this.addValueProvider(provider as ValueProvider);
    } else if (this.isFactoryProvider(provider)) {
      return this.addFactoryProvider(provider as FactoryProvider);
    }
  }

  private addFactoryProvider(provider: FactoryProvider) {
    const { useFactory, inject } = provider;
    const name = this.getCustomProviderName(provider);

    this._providers.set(
      name,
      new InstanceWrapper({
        name: name,
        metatype: useFactory,
        host: this,
        inject,
      })
    );
  }

  private addValueProvider(provider: ValueProvider) {
    const { useValue } = provider;
    const name = this.getCustomProviderName(provider);

    this._providers.set(
      name,
      new InstanceWrapper({
        name: name,
        metatype: useValue,
        host: this,
        instance: useValue,
        isResolved: true,
      })
    );
  }

  private addCalssProvider(provider: ClassProvider) {
    const { provide, useClass, inject } = provider;
    const name = this.getCustomProviderName(provider);

    this._providers.set(
      name,
      new InstanceWrapper({
        name: name,
        metatype: useClass,
        host: this,
        inject,
      })
    );
  }

  private getCustomProviderName(provider: CustomProvider) {
    return isFunction(provider.provide)
      ? (provider.provide as string)
      : (provider.provide as Function).name;
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
