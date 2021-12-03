import { PARAM_METADATA } from '@common/constants';

import { applyStackableMetadata } from './apply-stackable-metadata';

import type { ExecutionContext } from "@common/pipeline/execution-context.interface";

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
