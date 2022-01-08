import { GUARD_METADATA } from '@common/constants';
import { W_INT_TYPE } from '@common/fields';
import { ExecutionContext } from '@common/pipeline';
import { InjectionToken, InjectorLifetime } from '@watsonjs/di';
import { Observable } from 'rxjs';

import { applyInterceptorMetadata, InterceptorType } from './interceptor';

/**
 * Guards will check incoming commands for user permissions or other data you might
 * want to check before enabling them to run a command. If the guard returns false, the framework
 * will throw a `UnauthorizedException`. If don't want this to happen simply throw your own exception instead of returning `false`
 *
 * @param ctx The current execution context
 * @returns {boolean} Whether the user should be allowed to run the command or not.
 */
export interface CanActivate {
  canActivate(
    ctx: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean>;
}

interface WithCanActivate {
  prototype: CanActivate;
}

export type GuardFn = (ctx: ExecutionContext) => boolean;

export type GuardsMetadata = CanActivate | WithCanActivate;

export const GLOBAL_GUARD = new InjectionToken<GuardsMetadata[]>(
  "Filter that are applied globally",
  { providedIn: "root", lifetime: InjectorLifetime.Event }
);

GLOBAL_GUARD[W_INT_TYPE] = InterceptorType.Guard;

export const GUARD = new InjectionToken<GuardsMetadata[]>(
  "Filter for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

GUARD[W_INT_TYPE] = InterceptorType.Guard;

export function UseGuards(
  ...guards: GuardsMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInterceptorMetadata(
      InterceptorType.Guard,
      GUARD_METADATA,
      guards,
      target,
      descriptor
    );
  };
}
