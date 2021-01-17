import { EVENT_METADATA } from '../../constants';
import { IClientEvent } from '../../interfaces';
import { isUndefined } from '../../utils';

/**
 * Calls the decorated method whenever an event of the type specified is emitted by the client.
 * @param type The event type
 *
 * @default raw
 * If no event type is specified the method will be called with all `raw` event values.
 */
export function Event(): MethodDecorator;
export function Event(type: IClientEvent): MethodDecorator;
export function Event(type?: IClientEvent): MethodDecorator {
  return (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    const eventType = isUndefined(type) ? "raw" : type;
    Reflect.defineMetadata(EVENT_METADATA, eventType, descriptor.value);
  };
}
