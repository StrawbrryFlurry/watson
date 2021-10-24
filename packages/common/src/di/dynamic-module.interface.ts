import { Type } from '@common/interfaces/type.interface';

import { CustomProvider } from './custom-provider.interface';

export interface DynamicModule {
  module: Type;
  imports?: (Type | DynamicModule | Promise<DynamicModule>)[];
  receivers?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: (Type | CustomProvider)[];
  global?: boolean;
}
