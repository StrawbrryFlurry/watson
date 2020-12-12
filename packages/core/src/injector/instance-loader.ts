import { WatsonContainer } from '../watson-container';
import { Injector } from './injector';
import { Module } from './module';

export class InstanceLoader {
  private injector = new Injector();
  private container: WatsonContainer;

  constructor(container: WatsonContainer) {
    this.container = container;
  }

  public createInstances() {
    const modules = this.container.getModules();

    for (const [token, module] of modules) {
      this.createInstancesOfInjectables(module);
      this.createInstancesOfProviders(module);
      this.createInstancesOfReceivers(module);
    }
  }

  private createInstancesOfProviders(module: Module) {
    const { providers } = module;

    for (const [name, provider] of providers) {
      this.injector.loadProvider(provider, module);
    }
  }

  private createInstancesOfReceivers(module: Module) {
    const { receivers } = module;

    for (const [name, receiver] of receivers) {
      this.injector.loadProvider(receiver, module);
    }
  }

  private createInstancesOfInjectables(module: Module) {
    const { injectables } = module;

    for (const [name, injectable] of injectables) {
      this.injector.loadInjectable(injectable, module);
    }
  }
}
