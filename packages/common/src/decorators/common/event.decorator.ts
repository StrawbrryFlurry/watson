import { EVENT_METADATA } from '../../constants';
import { WatsonEvent } from '../../enums/watson-event.enum';

/**
 * Calls the decorated method whenever an event of the type specified is emitted by the client.
 * @param type The event type
 *
 * @default raw
 * If no event type is specified the method will be called with all `raw` event values.
 */
export function Event(): MethodDecorator;
export function Event(type: WatsonEvent): MethodDecorator;
export function Event(event: WatsonEvent = WatsonEvent.RAW): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    Reflect.defineMetadata(EVENT_METADATA, event, descriptor.value);
  };
}
