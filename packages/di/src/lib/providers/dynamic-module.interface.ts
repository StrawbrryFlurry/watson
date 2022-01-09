import { Type } from '@di/types';

import { CustomProvider } from './custom-provider.interface';
import { InjectionToken } from './injection-token';

export interface WatsonDynamicModule {
  module: Type;
  imports?: (Type | WatsonDynamicModule | Promise<WatsonDynamicModule>)[];
  components?: Type[];
  providers?: (Type | CustomProvider)[];
  exports?: (Type | InjectionToken)[];
}
