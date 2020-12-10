import { Injector, MetadataResolver, Module } from './injector';
import { WatsonContainer } from './injector/container';

export class WatsonApplicationContext {
  private container: WatsonContainer;

  private injector: Injector;
  private modules: Module[];
  private resolver: MetadataResolver;
}
