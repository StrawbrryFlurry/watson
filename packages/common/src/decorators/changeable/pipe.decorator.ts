import { PipeTransform } from 'interfaces';

import { PIPE_METADATA } from '../../constants';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export function UsePipes(
  ...pipes: (PipeTransform | Function)[]
): MethodDecorator | ClassDecorator {
  return (
    target: any,
    propertykey?: string,
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
