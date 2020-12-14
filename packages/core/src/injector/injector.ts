import { TInjectable, TReceiver, Type } from "@watson/common";
import { wrap } from "module";
import { UnknownProviderException } from "../exceptions";
import { UnknownComponentReferenceException } from "../exceptions/unknown-component-reference.exception";

import { InstanceWrapper } from "./instance-wrapper";
import { Module } from "./module";

export class Injector {
  constructor() {}

  /**
   * Creates an instance of the wrapper provided in the argument resolving dependencies using the module provided.
   * @param wrapper The instance wrapper used to create the instnace
   * @param module The module to get the dependencies from
   */
  public createInstance<T = any>(wrapper: InstanceWrapper<T>, module: Module) {
    if (wrapper.isResolved) {
      return wrapper.instance;
    }

    const { metatype } = wrapper;
    let dependencies = [];

    if (!metatype) {
      throw new UnknownComponentReferenceException(wrapper.name, module.name);
    }

    if (!wrapper.hasNoDependencies()) {
      dependencies = this.resolveConstructorParam(wrapper, module);
    }

    const instance = Reflect.construct(wrapper.metatype, dependencies) as T;
    wrapper.setInstance((instance as unknown) as Type);

    return instance;
  }

  /**
   * @param provider The instance wrapper of a provider that should be looked up in  the exports of the target module
   * @param module The target module
   */
  public lookupProviderInImports(
    provider: InstanceWrapper<TInjectable>,
    module: Module
  ) {
    const { imports } = module;
    const importsArray = Array.from(imports);

    if (imports.size === 0) {
      throw new UnknownComponentReferenceException(provider.name, module.name);
    }

    const moduleRef = importsArray.find((module) =>
      module.exports.has(provider.name)
    );

    if (typeof moduleRef === "undefined") {
      throw new UnknownProviderException(provider.name, module.name);
    }

    const providerRef = moduleRef.providers.get(provider.name);

    if (providerRef.isResolved) {
      return providerRef.instance;
    }

    this.createInstance(providerRef, moduleRef);
    return providerRef.instance;
  }

  /**
   * @param wrapper The instance wrapper which dependencies should be resolved
   * @param module The host module of the wrapper
   */
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

  public loadInjectable(
    injectable: InstanceWrapper<TInjectable>,
    module: Module
  ) {
    this.createInstance(injectable, module);
  }

  public loadReceiver(receiver: InstanceWrapper<TReceiver>, module: Module) {
    this.createInstance(receiver, module);
  }
}
