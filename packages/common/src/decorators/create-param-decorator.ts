import { applyStackableMetadata } from '@common/decorators';

import { PARAM_METADATA } from '../constants';
import { ExecutionContext } from '../interfaces';

export type ParamFactoryFn<T = any> = (ctx: ExecutionContext) => T;

export interface ParameterMetadata {
  parameterIndex: number;
  factory?: (ctx: ExecutionContext) => unknown;
}

export function createCustomParamDecorator<T = any>(
  paramFactory: ParamFactoryFn<T>
): () => ParameterDecorator {
  return function () {
    return (
      target: Object,
      propertyKey: string | symbol,
      parameterIndex: number
    ) => {
      const metadata: ParameterMetadata = {
        parameterIndex,
        factory: paramFactory,
      };

      applyStackableMetadata(
        PARAM_METADATA,
        target.constructor,
        [metadata],
        propertyKey
      );
    };
  };
}
