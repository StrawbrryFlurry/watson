import { Injector, ModuleRef } from '@di';
import {
  isFunction,
  isNil,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
  ProviderDef,
  ReceiverDef,
} from '@watsonjs/common';
import iterate from 'iterare';

import { ModuleContainer } from '../../di/module-container';
import { InstanceWrapper } from '../../injector';

type ComponentWithLifecycleFunction = { [key: string]: Function };

export class LifecycleHost {
  constructor(private readonly injector: Injector) {}

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
    module: ModuleRef
  ): InstanceWrapper<ReceiverDef | ProviderDef>[] {
    const { receivers, providers } = module;

    const receiverWrappers = iterate(receivers).map(
      ([key, receiver]) => receiver
    );

    const ProviderWrappers = iterate(providers).map(
      ([key, provider]) => provider
    );

    return [...receiverWrappers, ...ProviderWrappers];
  }

  private async getModules(): Promise<ModuleRef[]> {
    const { modules } = await this.injector.get(ModuleContainer);

    const moduleRefs = iterate(modules)
      .map(([metatype, module]) => module)
      .toArray();

    return moduleRefs;
  }

  private async getModulesWithLifecycleHook<T>(
    modules: ModuleRef[],
    hook: keyof T
  ): Promise<ComponentWithLifecycleFunction[]> {
    const moduleWrappers = await Promise.all(
      modules.map((module) => module.instance)
    );

    const modulesWithLifecycleHook = this.getInstancesWithLifecycleHook(
      moduleWrappers,
      hook
    );

    return modulesWithLifecycleHook;
  }
}
