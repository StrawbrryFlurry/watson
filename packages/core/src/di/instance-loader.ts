import { COMPLETED, CREATING_COMPONENT_INSTANCES, Logger } from "../logger";
import { WatsonContainer } from "../watson-container";
import { Injector } from "./injector";
import { MetadataResolver } from "./metadata-resolver";
import { Module } from "./module";

export class InstanceLoader {
  private resolver: MetadataResolver;
  private injector: Injector;
  private logger = new Logger("InstanceLoader");
  private container: WatsonContainer;

  constructor() {
    this.resolver = new MetadataResolver(this.container);
    this.injector = new Injector(this.resolver);
  }

  public async createInstances() {
    const modules = this.container.getModules();

    this.logger.logMessage(CREATING_COMPONENT_INSTANCES());

    for (const [token, module] of modules) {
      await this.createInstancesOfInjectables(module);
      await this.createInstancesOfProviders(module);
      await this.createInstancesOfReceivers(module);
    }

    this.container.globalInstanceHost.applyInstances();
    this.logger.logMessage(COMPLETED());
  }

  private async createInstancesOfProviders(module: Module) {
    const { providers } = module;

    for (const [name, provider] of providers) {
      await this.injector.loadProvider(provider, module);
    }
  }

  private async createInstancesOfReceivers(module: Module) {
    const { receivers } = module;

    for (const [name, receiver] of receivers) {
      this.injector.loadProvider(receiver, module);
    }
  }

  private async createInstancesOfInjectables(module: Module) {
    const { injectables } = module;

    for (const [name, injectable] of injectables) {
      this.injector.loadInjectable(injectable, module);
    }
  }
}
