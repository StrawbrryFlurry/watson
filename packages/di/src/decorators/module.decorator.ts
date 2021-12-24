import { MODULE_DEFINITION_METADATA } from '@di/constants';
import { CustomProvider, WatsonDynamicModule } from '@di/providers';
import { Type } from '@di/types';

export interface WatsonModuleOptions {
  imports?: (Type | WatsonDynamicModule | Promise<WatsonDynamicModule>)[];
  components?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: Type[];
}

export function WatsonModule(options: WatsonModuleOptions): ClassDecorator {
  const metadata: WatsonModuleOptions = {
    ...{
      exports: undefined,
      imports: undefined,
      providers: undefined,
      components: undefined,
    },
    ...options,
  };

  return (target: Object) => {
    Reflect.defineMetadata(MODULE_DEFINITION_METADATA, metadata, target);
  };
}

export function isDynamicModule(
  module: Type | WatsonDynamicModule
): module is WatsonDynamicModule {
  return "module" in module;
}
