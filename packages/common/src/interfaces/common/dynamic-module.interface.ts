import { Type } from '../type.interface';
import { CustomProvider } from './custom-provider.interface';

export interface DynamicModule {
  module: Type;
  receivers?: Type[];
  providers?: (Type | CustomProvider)[];
  imports?: Type[];
  exports?: (Type | CustomProvider)[];
  global?: boolean;
}
