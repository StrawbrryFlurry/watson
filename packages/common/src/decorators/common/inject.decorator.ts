import { applyStackableMetadata } from '@decorators';

import { INJECT_DEPENDENCY_METADATA } from '../../constants';
import { Type } from '../../interfaces';

export interface InjectMetadata {
  propertyKey: string | symbol;
  parameterIndex: number;
  provide: Type | string;
}

/**
 * Injects a dependency into the argument
 * of a class constructor.
 *
 * Note that this decorator cannot be used
 * in class methods.
 */
export function Inject(token: Type | string): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    const metadata: InjectMetadata = {
      provide: token,
      propertyKey: propertyKey,
      parameterIndex: parameterIndex,
    };

    applyStackableMetadata(INJECT_DEPENDENCY_METADATA, target.constructor, [
      metadata,
    ]);
  };
}
