import { CustomProvider, DynamicModule, Type } from '../../interfaces';
import { isUndefined } from '../../utils';

export interface IModuleOptions {
  imports?: (Type | DynamicModule | Promise<DynamicModule>)[];
  receivers?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: (Type | CustomProvider)[];
}

export function Module(moduleOptions?: IModuleOptions): ClassDecorator {
  const options = isUndefined(moduleOptions)
    ? {
        imports: undefined,
        receivers: undefined,
        providers: undefined,
        exports: undefined,
      }
    : moduleOptions;

  return (target: Object) => {
    Object.entries(options).forEach(([key, value]) => {
      Reflect.defineMetadata(`module:${key}`, value, target);
    });
  };
}
