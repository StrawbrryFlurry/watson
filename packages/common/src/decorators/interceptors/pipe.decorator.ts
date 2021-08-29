import { PIPE_METADATA } from '@constants';
import { CommandArgument, PipeTransform } from '@interfaces';
import { isMethodDecorator } from '@utils';

import { applyStackableMetadata } from '../apply-stackable-metadata';

type PipeTransformFn = <T extends CommandArgument, R>(argument: T) => R;

interface WithPipeTransform {
  prototype: PipeTransform;
}

export type PipesMetadata = PipeTransform | WithPipeTransform | PipeTransformFn;

/**
 * TODO:
 * Update to fit the current pipe implementation
 * ```
 */
export function UsePipes(
  ...pipes: PipesMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(PIPE_METADATA, descriptor.value, pipes);
    }

    applyStackableMetadata(PIPE_METADATA, target.constructor, pipes);
  };
}
