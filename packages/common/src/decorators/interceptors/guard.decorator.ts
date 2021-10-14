import { GUARD_METADATA } from '@constants';
import { InjectorLifetime } from '@decorators';
import { ExecutionContext, InjectionToken } from '@interfaces';
import { Observable } from 'rxjs';

import { W_INJ_TYPE } from '../..';
import { applyInjectableMetadata, ɵINJECTABLE_TYPE } from './is-injectable';

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

GLOBAL_GUARD[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Guard;

export const GUARD = new InjectionToken<GuardsMetadata[]>(
  "Filter for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

GUARD[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Guard;

export function UseGuards(
  ...guards: GuardsMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInjectableMetadata(
      ɵINJECTABLE_TYPE.Guard,
      GUARD_METADATA,
      guards,
      target,
      descriptor
    );
  };
}
