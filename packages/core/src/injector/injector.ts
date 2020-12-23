import { DESIGN_PARAMETERS, isNil, TInjectable, TReceiver, Type } from '@watson/common';

import { CircularDependencyException, UnknownProviderException } from '../exceptions';
import { UnknownComponentReferenceException } from '../exceptions/unknown-component-reference.exception';
import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

export class Injector {
  // TODO:
  // Global dependencies such as providers, receivers and services

  constructor() {}

  /**
   * Creates an instance of the wrapper provided in the argument resolving dependencies using the module provided.
   * @param wrapper The instance wrapper used to create the instnace
   * @param module The module to get the dependencies from
   * @param context The dependency resolving context. It is used to decect wether a dependency of a provider circularly references itself.
   */
  public createInstance<T = any>(
    wrapper: InstanceWrapper<T>,
    module: Module,
    context: InstanceWrapper[] = []
  ) {
    if (wrapper.isResolved) {
      return wrapper.instance;
    }

    const { metatype } = wrapper;

    if (!metatype) {
      throw new UnknownComponentReferenceException(
        "Injector",
        wrapper.name,
        module.name
      );
    }

    if (context.includes(wrapper)) {
      throw new CircularDependencyException("Injector", wrapper, context);
    }

    context.push(wrapper);
    const dependencies = this.resolveDependencies(wrapper);
    let ctorDependencies = [];

    if (dependencies.length !== 0) {
      ctorDependencies = this.resolveConstructorParam(
        wrapper,
        dependencies,
        module,
        context
      );
    }

    const instance = Reflect.construct(wrapper.metatype, ctorDependencies) as T;
    wrapper.setInstance((instance as unknown) as Type);
  }

  /**
   * @param provider The instance wrapper of a provider that should be looked up in  the exports of the target module
   * @param module The target module
   */
  public lookupProviderInImports(
    provider: Type,
    module: Module,
    context: InstanceWrapper[]
  ) {
    const { imports } = module;
    const importsArray = Array.from(imports);

    if (imports.size === 0) {
      throw new UnknownComponentReferenceException(
        "Injector",
        provider.name,
        module.name
      );
    }

    const moduleRef = importsArray.find((moduleRef) =>
      moduleRef.exports.has(provider.name)
    );

    if (typeof moduleRef === "undefined") {
      throw new UnknownProviderException(
        "Injector",
        provider.name,
        module.name
      );
    }

    const providerRef = moduleRef.providers.get(provider.name);

    if (providerRef.isResolved) {
      return providerRef.instance;
    }

    this.createInstance(providerRef, moduleRef, context);
    return providerRef.instance;
  }

  /**
   * @param wrapper The instance wrapper which dependencies should be resolved
   * @param module The host module of the wrapper
   */
  public resolveConstructorParam(
    wrapper: InstanceWrapper,
    dependencies: Type[],
    module: Module,
    context: InstanceWrapper[]
  ) {
    let ctorDependencies: unknown[] = [];

    for (const [idx, dependency] of dependencies.entries()) {
      if (typeof dependency === "undefined") {
        throw new CircularDependencyException("Injector", wrapper, context);
      }

      if (module.providers.has(dependency.name)) {
        const provider = module.providers.get(dependency.name);

        if (provider.isResolved) {
          ctorDependencies[idx] = provider.instance;
        }

        this.createInstance(provider, module, context);
        ctorDependencies[idx] = provider.instance;
      } else {
        ctorDependencies[idx] = this.lookupProviderInImports(
          dependency,
          module,
          context
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

  private resolveDependencies(wrapper: InstanceWrapper): Type[] {
    if (!isNil(wrapper.inject)) {
      return wrapper.inject;
    }

    return Reflect.getMetadata(DESIGN_PARAMETERS, wrapper.metatype) || [];
  }

  public resolveCommandParams() {}
}
