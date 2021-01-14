import { applyStackableMetadata } from 'decorators/apply-stackable-metadata';
import { Filter } from 'interfaces';

import { FILTER_METADATA } from '../../constants';

export function UseFilters(
  ...filters: (Filter | Function)[]
): MethodDecorator | ClassDecorator {
  return (
    target: any,
    propertykey?: string,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(FILTER_METADATA, filters, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(FILTER_METADATA, filters, target);
  };
}
