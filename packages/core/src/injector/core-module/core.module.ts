import { DynamicModule, Global, Module } from '@watsonjs/common';
import { CoreModuleRegister } from 'interfaces';

/**
 * The core module must have a static method called `register` which will
 * register internal modules and prioviders.
 */
@Global()
@Module()
export class CoreModule {
  public static register(args: CoreModuleRegister): DynamicModule {
    return {
      module: CoreModule,
      exports: args.exports || [],
      imports: args.imports || [],
      providers: args.providers || [],
      receivers: args.receivers || [],
    };
  }
}
