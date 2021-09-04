import { GUARD_METADATA } from '@constants';
import { applyStackableMetadata } from '@decorators';
import { isMethodDecorator } from '@utils';

import { CanActivate, ExecutionContext } from '../..';

interface WithCanActivate {
  prototype: CanActivate;
}

export type GuardFn = (ctx: ExecutionContext) => boolean;

export type GuardsMetadata = CanActivate | WithCanActivate;

export function UseGuards(
  ...guards: GuardsMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    if (isMethodDecorator(descriptor)) {
      return applyStackableMetadata(GUARD_METADATA, descriptor!.value, guards);
    }

    applyStackableMetadata(GUARD_METADATA, target.constructor, guards);
  };
}
