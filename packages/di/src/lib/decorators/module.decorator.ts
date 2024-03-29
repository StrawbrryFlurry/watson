import { MODULE_DEFINITION_METADATA } from '@di/constants';
import { CustomProvider } from '@di/providers/custom-provider.interface';
import { WatsonDynamicModule } from '@di/providers/dynamic-module.interface';
import { Type } from '@di/types';

export interface WatsonModuleOptions {
  imports?: (Type | WatsonDynamicModule | Promise<WatsonDynamicModule>)[];
  components?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: Type[];
}

/**
 * Decorator that marks a class as a module.
 * A module is a container for other components.
 * It can be imported by other modules or by other components.
 * A module can be imported by other modules or by other components.
 */
export function WatsonModule(
  options: WatsonModuleOptions = {}
): ClassDecorator {
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
