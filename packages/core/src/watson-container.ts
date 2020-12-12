import { ApplicationConfig } from './application-config';
import { Injector, MetadataResolver, Module } from './injector';

/**
 * Contains application state such as modules and provides an interface to get those
 *
 */
export class WatsonContainer {
  private injector: Injector = new Injector();
  private modules = new Map<string, Module>();
  private resolver: MetadataResolver = new MetadataResolver();
  private coreModule: Module;
  private config: ApplicationConfig;

  constructor(coreModule: Module, config: ApplicationConfig) {
    this.coreModule = coreModule;
  }

  resolve;
}
