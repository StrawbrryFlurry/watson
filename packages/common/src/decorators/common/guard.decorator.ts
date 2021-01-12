import { applyStackableMetadata } from 'decorators/apply-stackable-metadata';
import { CanActivate } from 'interfaces';

import { GUARD_METADATA } from '../../constants';

export function UseGuards(
  ...guards: (CanActivate | Function)[]
): MethodDecorator | ClassDecorator {
  return (
    target: any,
    propertykey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(GUARD_METADATA, guards, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(GUARD_METADATA, guards, target);
  };
}
