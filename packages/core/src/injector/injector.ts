import { CustomProvider, DESIGN_PARAMETERS, isNil, isString, TInjectable, TReceiver, Type } from '@watson/common';

import { CircularDependencyException, UnknownProviderException } from '../exceptions';
import { UnknownComponentReferenceException } from '../exceptions/unknown-component-reference.exception';
import { InstanceWrapper } from './instance-wrapper';
import { MetadataResolver } from './metadata-resolver';
import { Module } from './module';

export class Injector {
  constructor(private resolver: MetadataResolver) {}

  /**
   * Creates an instance of the wrapper provided in the argument resolving dependencies using the module provided.
   * @param wrapper The instance wrapper used to create the instnace
   * @param module The module to get the dependencies from
   * @param context The dependency resolving context. It is used to decect wether a dependency of a provider circularly references itself.
   */
  public async createInstance<T = any>(
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
    let ctorDependencies = await this.resolveConstructorParam(
      wrapper,
      dependencies,
      module,
      context
    );

    await this.instanciateClass(wrapper, module, ctorDependencies);
  }

  private async instanciateClass<T = any>(
    wrapper: InstanceWrapper<T>,
    module: Module,
    dependencies: any[]
  ) {
    const { inject } = wrapper;

    if (wrapper.isResolved) {
      return wrapper.instance;
    }

    if (isNil(inject)) {
      const instance = new wrapper.metatype(...dependencies);
      wrapper.setInstance(instance);
    } else {
      const factory = (wrapper.metatype as any) as Function;
      const factoryResult = await factory(...dependencies);
      wrapper.setInstance(factoryResult);
    }
  }

  /**
   * @param provider The instance wrapper of a provider that should be looked up in  the exports of the target module
   * @param module The target module
   */
  public async lookupProviderInImports(
    provider: Type | string,
    module: Module,
    context: InstanceWrapper[]
  ) {
    const { imports } = module;
    const importsArray = Array.from(imports);
    const name = this.getProviderName(provider);

    if (imports.size === 0) {
      throw new UnknownComponentReferenceException(
        "Injector",
        name,
        module.name
      );
    }

    const moduleRef = importsArray.find((moduleRef) =>
      moduleRef.exports.has(name)
    );

    if (typeof moduleRef === "undefined") {
      throw new UnknownProviderException("Injector", name, module.name);
    }

    const providerRef = moduleRef.providers.get(name);

    if (providerRef.isResolved) {
      return providerRef.instance;
    }

    await this.createInstance(providerRef, moduleRef, context);
    return providerRef.instance;
  }

  /**
   * @param wrapper The instance wrapper which dependencies should be resolved
   * @param module The host module of the wrapper
   */
  public async resolveConstructorParam(
    wrapper: InstanceWrapper,
    dependencies: (Type | string)[],
    module: Module,
    context: InstanceWrapper[]
  ) {
    let ctorDependencies: unknown[] = [];

    for (const [idx, dependency] of dependencies.entries()) {
      if (typeof dependency === "undefined") {
        throw new CircularDependencyException("Injector", wrapper, context);
      }

      const name = this.getProviderName(dependency);

      if (module.providers.has(name)) {
        const provider = module.providers.get(name);

        if (provider.isResolved) {
          ctorDependencies[idx] = provider.instance;
        } else {
          await this.createInstance(provider, module, context);
          ctorDependencies[idx] = provider.instance;
        }
      } else {
        ctorDependencies[idx] = await this.lookupProviderInImports(
          dependency,
          module,
          context
        );
      }
    }

    return ctorDependencies;
  }

  private getProviderName(dependency: CustomProvider | Type | string): string {
    if (isString(dependency)) {
      return dependency;
    } else if ("provide" in (dependency as CustomProvider)) {
      return isString((dependency as CustomProvider).provide)
        ? ((dependency as CustomProvider).provide as string)
        : ((dependency as CustomProvider).provide as Function).name;
    } else {
      return (dependency as Type).name;
    }
  }

  public async loadProvider(
    provider: InstanceWrapper<TInjectable>,
    module: Module
  ) {
    await this.createInstance(provider, module);
  }

  public async loadInjectable(
    injectable: InstanceWrapper<TInjectable>,
    module: Module
  ) {
    await this.createInstance(injectable, module);
  }

  public async loadReceiver(
    receiver: InstanceWrapper<TReceiver>,
    module: Module
  ) {
    await this.createInstance(receiver, module);
  }

  private resolveDependencies(wrapper: InstanceWrapper): (Type | string)[] {
    if (!isNil(wrapper.inject)) {
      return wrapper.inject;
    }

    const dependencies =
      this.resolver.getMetadata<any[]>(DESIGN_PARAMETERS, wrapper.metatype) ||
      [];

    return dependencies.reduce((deps: (Type | string)[], dep: Type, idx) => {
      const resolved = this.resolver.reflectInjectedProvider(
        wrapper.metatype,
        idx
      );

      if (isNil(resolved)) {
        deps.push(dep);
      } else {
        deps.push(resolved);
      }

      return deps;
    }, []);
  }
}
