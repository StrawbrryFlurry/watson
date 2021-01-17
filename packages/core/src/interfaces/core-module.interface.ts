import { CustomProvider, Type } from '@watsonjs/common';

/**
 * Type definitions for the `register` method arguments
 */
export interface CoreModuleRegister {
  imports: Type[];
  exports: Type[];
  providers: (Type | CustomProvider)[];
  receivers: Type[];
}
