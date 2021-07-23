import { GUARD_METADATA } from '../../constants';
import { CanActivate, Type } from '../../interfaces';
import { applyStackableMetadata } from '../apply-stackable-metadata';

export type TGuardsMetadata = CanActivate | Type;

export function UseGuards(
  ...guards: TGuardsMetadata[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) => {
    // Is method decorator
    if (typeof descriptor !== "undefined") {
      applyStackableMetadata(GUARD_METADATA, guards, descriptor.value);
    }

    // Is class decorator
    applyStackableMetadata(GUARD_METADATA, guards, target);
  };
}
