import { CustomProvider, DynamicModule, mergeDefaults, Type } from '../..';

export interface ModuleOptions {
  imports?: (Type | DynamicModule | Promise<DynamicModule>)[];
  receivers?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: (Type | CustomProvider)[];
}

export function Module(options: ModuleOptions = {}): ClassDecorator {
  const metadata = mergeDefaults<any>(options, {
    exports: undefined,
    imports: undefined,
    providers: undefined,
    receivers: undefined,
  });

  return (target: Object) => {
    for (const [key, value] of Object.entries(metadata)) {
      Reflect.defineMetadata(`module-${key}:meta`, value, target);
    }
  };
}

export function isDynamicModule(
  module: Type | DynamicModule
): module is DynamicModule {
  return "module" in module;
}
