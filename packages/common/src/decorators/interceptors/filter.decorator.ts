import { FILTER_METADATA } from '../../constants';
import { PassThrough, Type } from '../../interfaces';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export type TFiltersMetadata = PassThrough | Type;

export function UseFilters(
  ...filters: TFiltersMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
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
