import { CustomProvider, Type } from '@watson/common';

/**
 * Type definitions for the `register` method arguments
 */
export interface CoreModuleRegister {
  imports: Type[];
  exports: Type[];
  providers: (Type | CustomProvider)[];
  receivers: Type[];
}
