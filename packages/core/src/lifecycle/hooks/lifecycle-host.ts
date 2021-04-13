import {
  isFunction,
  isNil,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
  TProvider,
  TReceiver,
} from '@watsonjs/common';
import iterate from 'iterare';

import { InstanceWrapper, Module } from '../../injector';
import { WatsonContainer } from '../../watson-container';

type ComponentWithLifecycleFunction = { [key: string]: Function };

export class LifecycleHost {
  constructor(private readonly container: WatsonContainer) {}

  public async callOnApplicationBootstrapHook() {
    return this.callLifecycleHook<OnApplicationBootstrap>(
      "onApplicationBootstrap"
    );
  }

  public async callOnApplicationShutdownHook() {
    await this.callOnModuleDestroyHook();
    return this.callLifecycleHook<OnApplicationShutdown>(
      "onApplicationShutdown"
    );
  }

  public async callOnModuleInitHook() {
    return this.callLifecycleHook<OnModuleInit>("onModuleInit");
  }

  public async callOnModuleDestroyHook() {
    return this.callLifecycleHook<OnModuleDestroy>("onModuleDestroy");
  }

  private async callLifecycleHook<T>(hook: keyof T): Promise<void> {
    const modules = this.getModules();
    const modulesWithLifecycleHook = await this.getModulesWithLifecycleHook<T>(
      modules,
      hook
    );

    for (const module of modules) {
      const components = this.getModuleComponents(module);
      const instances = this.getInstancesWithLifecycleHook<T>(components, hook);

      await Promise.all(
        instances.map((instance) => instance[hook as string]())
      );
    }

    await Promise.all(
      modulesWithLifecycleHook.map((module) => module[hook as string]())
    );
  }

  private getInstancesWithLifecycleHook<T>(
    wrappers: InstanceWrapper[],
    hook: keyof T
  ): ComponentWithLifecycleFunction[] {
    return wrappers
      .filter((wrapper) => !isNil(wrapper))
      .map((wrapper) => wrapper.instance)
      .filter((instance) => !isNil(instance))
      .filter((instance) => isFunction(instance[hook]));
  }

  private getModuleComponents(
    module: Module
  ): InstanceWrapper<TReceiver | TProvider>[] {
    const { receivers, providers } = module;

    const receiverWrappers = iterate(receivers).map(
      ([key, receiver]) => receiver
    );

    const ProviderWrappers = iterate(providers).map(
      ([key, provider]) => provider
    );

    return [...receiverWrappers, ...ProviderWrappers];
  }

  private getModules(): Module[] {
    const modulesMap = this.container.getModules();
    const modules = iterate(modulesMap)
      .map(([token, module]) => module)
      .toArray();

    return modules;
  }

  private async getModulesWithLifecycleHook<T>(
    modules: Module[],
    hook: keyof T
  ): Promise<ComponentWithLifecycleFunction[]> {
    const moduleWrappers = await Promise.all(
      modules.map((module) => module.getModuleInstance())
    );

    const modulesWithLifecycleHook = this.getInstancesWithLifecycleHook(
      moduleWrappers,
      hook
    );

    return modulesWithLifecycleHook;
  }
}
