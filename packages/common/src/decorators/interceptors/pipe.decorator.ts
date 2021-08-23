import { PIPE_METADATA } from '@constants';
import { CommandArgument } from '@interfaces/command';
import { PipeTransform } from '@interfaces/interceptors';
import { Type } from '@interfaces/type.interface';

import { applyStackableMetadata } from '../apply-stackable-metadata';

type PipeTransformFn = <T extends CommandArgument, R>(argument: T) => R;

export type PipesMetadata = (PipeTransform | Type | PipeTransformFn)[];

/**
 * TODO:
 * Update to fit the current pipe implementation
 * ```
 */
export function UsePipes(
  ...pipes: PipesMetadata
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(PIPE_METADATA, pipes, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(PIPE_METADATA, pipes, target);
  };
}
