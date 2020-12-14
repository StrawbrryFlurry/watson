import { TInjectable, Type } from '@watson/common';

import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

export class Injector {
  constructor() {}

  private createInstance<T = any>(wrapper: InstanceWrapper<T>, module: Module) {
    if (wrapper.isResolved) {
      return wrapper.instance;
    }

    let dependencies = [];

    if (wrapper.hasNoDependencies()) {
      dependencies = [];
    } else {
      dependencies = this.resolveConstructorParam(wrapper, module);
    }

    const instance = Reflect.construct(wrapper.metatype, dependencies) as T;
    wrapper.setInstance((instance as unknown) as Type);
    return instance;
  }

  // TODO:
  // Don't call this recursively
  public lookupProviderInImports(
    provider: InstanceWrapper<TInjectable>,
    module: Module
  ) {
    const { imports } = module;
    const importsArray = Array.from(imports);

    if (imports.size === 0) {
      return undefined;
    }

    const moduleRefExports = importsArray.map((module) => module.exports);

    // TODO:
    // Check the imported modules if they export a provider with the requested type!!!
    // Check if the module already has an instance of the provider.
    // If not create it and return its value
    if (moduleRefExports.includes(provider.name))
      const moduleProvider = moduleRefExports.find((moduleProvider) =>
        moduleProvider.has(provider.name)
      );

    if (typeof moduleProvider === "undefined") {
      for (const importedModule of importsArray) {
        const providerRef = this.lookupProviderInImports(
          provider,
          importedModule
        );

        if (typeof providerRef !== "undefined") {
          if (providerRef.isResolved) {
            return providerRef.instance;
          }

          this.createInstance(providerRef, module);
          return providerRef.instance;
        }
      }
    } else {
      const providerRef = moduleProvider.get(provider.name);

      if (providerRef.isResolved) {
        return providerRef.instance;
      }

      this.createInstance(providerRef, module);
      return providerRef.instance;
    }
  }

  public resolveConstructorParam(wrapper: InstanceWrapper, module: Module) {
    const dependencies = wrapper.getDependencies().entries();
    let ctorDependencies: unknown[] = [];

    for (const [idx, dependency] of dependencies) {
      if (module.providers.has(dependency.name)) {
        const provider = module.providers.get(dependency.name);

        if (provider.isResolved) {
          ctorDependencies[idx] = provider.instance;
        }

        this.createInstance(dependency, module);
        ctorDependencies[idx] = dependency.instance;
      } else {
        ctorDependencies[idx] = this.lookupProviderInImports(
          dependency,
          module
        );
      }
    }

    return ctorDependencies;
  }

  public loadProvider(provider: InstanceWrapper<TInjectable>, module: Module) {
    this.createInstance(provider, module);
  }

  public loadInjectable(injectable: InstanceWrapper, module: Module) {
    this.createInstance(injectable, module);
  }

  public loadReceiver(receiver: InstanceWrapper, module: Module) {
    this.createInstance(receiver, module);
  }
}
