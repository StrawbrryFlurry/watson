import { FILTER_METADATA } from '@common/constants';
import { W_INT_TYPE } from '@common/fields';
import { ExecutionContext } from '@common/pipeline';
import { InjectionToken, InjectorLifetime } from '@watsonjs/di';
import { Observable } from 'rxjs';

import { applyInterceptorMetadata, ɵINTERCEPTOR_TYPE } from './is-interceptor';

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

export const GLOBAL_FILTER = new InjectionToken<FiltersMetadata[]>(
  "Filters that are applied globally",
  { providedIn: "root", lifetime: InjectorLifetime.Event }
);

GLOBAL_FILTER[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.Filter;

export const FILTER = new InjectionToken<FiltersMetadata[]>(
  "Filters for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

FILTER[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.Filter;

export function UseFilters(
  ...filters: FiltersMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInterceptorMetadata(
      ɵINTERCEPTOR_TYPE.Filter,
      FILTER_METADATA,
      filters,
      target,
      descriptor
    );
  };
}
