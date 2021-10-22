import { INTERCEPTOR_METADATA } from '@common/constants';
import { InjectorLifetime } from '@common/decorators';
import { W_INJ_TYPE } from '@common/fields';
import { ExecutionContext, InjectionToken } from '@common/interfaces';
import { Observable } from 'rxjs';

import { applyInjectableMetadata, ɵINJECTABLE_TYPE } from './is-injectable';

export type NextHandler = () => any;

export interface WatsonInterceptor {
  intercept<T>(ctx: ExecutionContext, next: NextHandler): Observable<T>;
}

interface WithIntercept {
  prototype: WatsonInterceptor;
}

export type InterceptorMetadata = WatsonInterceptor | WithIntercept;

export const GLOBAL_INTERCEPTOR = new InjectionToken<InterceptorMetadata[]>(
  "Interceptor that are applied globally",
  { providedIn: "root", lifetime: InjectorLifetime.Event }
);

GLOBAL_INTERCEPTOR[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Interceptor;

export const INTERCEPTOR = new InjectionToken<InterceptorMetadata[]>(
  "Interceptor for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

INTERCEPTOR[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Interceptor;

export function UseInterceptors(
  ...interceptors: InterceptorMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInjectableMetadata(
      ɵINJECTABLE_TYPE.Interceptor,
      INTERCEPTOR_METADATA,
      interceptors,
      target,
      descriptor
    );
  };
}
