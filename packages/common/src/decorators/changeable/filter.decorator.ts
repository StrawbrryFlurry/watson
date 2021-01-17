import { Filter } from 'interfaces';

import { FILTER_METADATA } from '../../constants';
import { applyStackableMetadata } from '../apply-stackable-metadata';

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
