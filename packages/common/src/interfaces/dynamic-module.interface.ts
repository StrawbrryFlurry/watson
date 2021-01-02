import { CustomProvider } from './custom-provider.interface';
import { Type } from './type.interface';

export interface DynamicModule {
  module: Type;
  receivers?: Type[];
  providers?: (Type | CustomProvider)[];
  imports?: Type[];
  exports?: Type[];
}
