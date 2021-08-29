import { FILTER_METADATA } from '@constants';
import { PassThrough } from '@interfaces';
import { isMethodDecorator } from '@utils';

import { applyStackableMetadata } from '../apply-stackable-metadata';

interface WithPassThrough {
  prototype: PassThrough;
}

export type FiltersMetadata = PassThrough | WithPassThrough;

export function UseFilters(
  ...filters: FiltersMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(FILTER_METADATA, descriptor.value, filters);
    }

    applyStackableMetadata(FILTER_METADATA, target.constructor, filters);
  };
}
