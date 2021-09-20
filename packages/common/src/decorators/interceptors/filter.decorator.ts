import { FILTER_METADATA } from '@constants';
import { ExecutionContext } from '@interfaces';
import { isMethodDecorator } from '@utils';
import { Observable } from 'rxjs';

import { applyStackableMetadata } from '../apply-stackable-metadata';

/**
 * Filters work in a similar way to guards. Their difference being that they will not throw an error if the command shouldn't be run.
 * Additionally they're also supported on EventRoutes.
 * @param context The current execution context
 * @returns {boolean} Whether the user should be allowed to run the command or not.
 */
export interface PassThrough {
  pass(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;
}

interface WithPassThrough {
  prototype: PassThrough;
}

export type FilterFn = (ctx: ExecutionContext) => boolean;

export type FiltersMetadata = PassThrough | WithPassThrough | FilterFn;

export function UseFilters(
  ...filters: FiltersMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(
        FILTER_METADATA,
        descriptor!.value,
        filters
      );
    }

    applyStackableMetadata(FILTER_METADATA, target.constructor, filters);
  };
}
