import {
  isFunction,
  isNil,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@watsonjs/common';
import { Injector, ModuleContainer, ModuleRef, resolveAsyncValue, Type } from '@watsonjs/di';
import iterate from 'iterare';

type ComponentWithLifecycleFunction<T extends {}> = {
  [key in keyof T]: Function;
};

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

  private async callLifecycleHook<T extends {}>(hook: keyof T): Promise<void> {
    const modules = await this.getModules();
    const modulesWithLifecycleHook = await this.getModulesWithLifecycleHook<T>(
      modules,
      hook
    );

    for (const module of modules) {
      const components = this.getModuleComponents(module);
      const componentInstances: unknown[] = [];

      for (const component of components) {
        const instance = await module.get(component);
        componentInstances.push(instance);
      }

      const instances = this.getInstancesWithLifecycleHook<T>(
        componentInstances,
        hook
      );

      await resolveAsyncValue(
        instances.map((instance) => instance[hook as string]())
      );
    }

    await resolveAsyncValue(
      modulesWithLifecycleHook.map((module) => module[hook as string]())
    );
  }

  private getInstancesWithLifecycleHook<T extends {}>(
    wrappers: unknown[],
    hook: keyof T
  ): ComponentWithLifecycleFunction<T>[] {
    return wrappers
      .filter((instance) => !isNil(instance))
      .filter((instance) =>
        isFunction((<ComponentWithLifecycleFunction<T>>instance)[hook])
      ) as ComponentWithLifecycleFunction<T>[];
  }

  private getModuleComponents(module: ModuleRef): Type[] {
    const { components, providers } = module;
    return [...components, ...providers] as Type[];
  }

  private async getModules(): Promise<ModuleRef[]> {
    const { modules } = await this.injector.get(ModuleContainer);

    const moduleRefs = iterate(modules)
      .map(([metatype, module]) => module)
      .toArray();

    return moduleRefs;
  }

  private async getModulesWithLifecycleHook<T extends {}>(
    modules: ModuleRef[],
    hook: keyof T
  ): Promise<ComponentWithLifecycleFunction<T>[]> {
    const moduleInstances = await Promise.all(
      modules.map((module) => module.getInstance())
    );

    const modulesWithLifecycleHook = this.getInstancesWithLifecycleHook(
      moduleInstances,
      hook
    );

    return modulesWithLifecycleHook;
  }
}
