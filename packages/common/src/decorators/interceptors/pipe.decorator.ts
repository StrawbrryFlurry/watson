import { PIPE_METADATA } from '@constants';
import { InjectorLifetime, InterceptorMetadata } from '@decorators';
import { CommandArgument, InjectionToken } from '@interfaces';
import { Observable } from 'rxjs';

import { W_INJ_TYPE } from '../..';
import { applyInjectableMetadata, ɵINJECTABLE_TYPE } from './is-injectable';

/**
 * Alters an argument passed to a route
 */
export interface PipeTransform<T extends CommandArgument = any, R = any> {
  transform(argument: T): R | Promise<R> | Observable<R>;
}

interface WithPipeTransform {
  prototype: PipeTransform;
}

export type PipeTransformFn = <T extends CommandArgument, R>(argument: T) => R;

export type PipesMetadata = PipeTransform | WithPipeTransform | PipeTransformFn;

export const GLOBAL_PIPE = new InjectionToken<InterceptorMetadata[]>(
  "Pipe that are applied globally",
  { providedIn: "root", lifetime: InjectorLifetime.Event }
);

GLOBAL_PIPE[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Pipe;

export const PIPE = new InjectionToken<InterceptorMetadata[]>(
  "Pipe for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

PIPE[W_INJ_TYPE] = ɵINJECTABLE_TYPE.Pipe;

/**
 * TODO:
 * Update to fit the current pipe implementation
 * ```
 */
export function UsePipes(
  ...pipes: PipesMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    return applyInjectableMetadata(
      ɵINJECTABLE_TYPE.Pipe,
      PIPE_METADATA,
      pipes,
      target,
      descriptor
    );
  };
}
