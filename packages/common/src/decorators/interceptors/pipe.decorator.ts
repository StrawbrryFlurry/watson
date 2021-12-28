import { CommandArgument } from '@common/command/command-argument.interface';
import { PIPE_METADATA } from '@common/constants';
import { W_INT_TYPE } from '@common/fields';
import { InjectionToken, InjectorLifetime } from '@watsonjs/di';
import { Observable } from 'rxjs';

import { applyInterceptorMetadata, ɵINTERCEPTOR_TYPE } from './interceptor';

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

export const GLOBAL_PIPE = new InjectionToken<PipesMetadata[]>(
  "Pipe that are applied globally",
  { providedIn: "root", lifetime: InjectorLifetime.Event }
);

GLOBAL_PIPE[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.Pipe;

export const PIPE = new InjectionToken<PipesMetadata[]>(
  "Pipe for the current module",
  { providedIn: "module", lifetime: InjectorLifetime.Event }
);

PIPE[W_INT_TYPE] = ɵINTERCEPTOR_TYPE.Pipe;

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
    return applyInterceptorMetadata(
      ɵINTERCEPTOR_TYPE.Pipe,
      PIPE_METADATA,
      pipes,
      target,
      descriptor
    );
  };
}
