import { COMMAND_RESTRICTION_METADATA } from '../../constants';
import { IRestrictionType } from '../interfaces';

export function createRestrictionDecorator(
  type: IRestrictionType,
  payload: unknown,
  options?: unknown
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const existing =
      Reflect.getMetadata(COMMAND_RESTRICTION_METADATA, descriptor.value) || [];

    const payloadArray = Array.isArray(payload) ? payload : [payload];

    const metadata = {
      type: type,
      payload: payloadArray,
      options: options,
    };

    Reflect.defineMetadata(
      COMMAND_RESTRICTION_METADATA,
      [...existing, metadata],
      descriptor.value
    );
  };
}
