import { CustomProvider, Type, WatsonDynamicModule, WatsonModule, WatsonModuleOptions } from '@watsonjs/di';

export interface ModuleOptions {
  imports?: (Type | DynamicModule | Promise<DynamicModule>)[];
  routers?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: (Type | CustomProvider)[];
}

export interface DynamicModule extends Omit<WatsonDynamicModule, "components"> {
  routers?: Type[];
}

export function Module(options: ModuleOptions = {}): ClassDecorator {
  const moduleOptions: WatsonModuleOptions = {
    components: options.routers ?? undefined,
    providers: options.providers ?? undefined,
    imports: options.imports ?? undefined,
    exports: options.exports ?? undefined,
  };

  return WatsonModule(moduleOptions);
}
