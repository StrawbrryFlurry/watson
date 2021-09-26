import { PIPE_METADATA } from '@constants';
import { InterceptorMetadata } from '@decorators';
import { CommandArgument, InjectionToken } from '@interfaces';
import { isMethodDecorator } from '@utils';
import { Observable } from 'rxjs';

import { applyStackableMetadata } from '../apply-stackable-metadata';

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
  "Pipe that are applied globally"
);

export const PIPE = new InjectionToken<InterceptorMetadata[]>(
  "Pipe for the current module"
);

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
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(PIPE_METADATA, descriptor!.value, pipes);
    }

    applyStackableMetadata(PIPE_METADATA, target.constructor, pipes);
  };
}
