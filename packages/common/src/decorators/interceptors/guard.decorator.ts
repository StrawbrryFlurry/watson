import { isMethodDecorator } from '@utils';

import { GUARD_METADATA } from '../../constants';
import { CanActivate } from '../../interfaces';
import { applyStackableMetadata } from '../apply-stackable-metadata';

interface WithCanActivate {
  prototype: CanActivate;
}

export type GuardsMetadata = CanActivate | WithCanActivate;

export function UseGuards(
  ...guards: GuardsMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(GUARD_METADATA, descriptor.value, guards);
    }

    applyStackableMetadata(GUARD_METADATA, target.constructor, guards);
  };
}
