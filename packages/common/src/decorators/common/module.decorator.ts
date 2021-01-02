import { CustomProvider, DynamicModule, Type } from '../../interfaces';
import { isUndefined } from '../../utils';

export interface IModuleOptions {
  imports?: (Type | DynamicModule)[];
  receivers?: (Type | CustomProvider)[];
  providers?: Type[];
  exports?: Type[];
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
