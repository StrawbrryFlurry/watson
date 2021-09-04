import { mergeDefaults } from '../..';
import { CustomProvider, DynamicModule, Type } from '../../interfaces';

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
