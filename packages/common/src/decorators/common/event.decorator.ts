import { EVENT_METADATA } from '@common/constants';
import { WatsonEvent } from '@common/enums';

/**
 * Calls the decorated method whenever an event of
 * the type specified is emitted by the client.
 *
 * Default:
 * If no event type is specified the we try to deduce the method using
 * it's name. If there is no match, the `raw` event will be used.
 *
 *
 * Watson will figure out what arguments of the method descriptor
 * refers to what event argument. If the event emits values of a
 * given type, that value is used.
 *
 * If the event emits multiple values of the same type,
 * we assign their value to the descriptor.
 *
 * Example:
 * VoiceChannelChange => [PreviousChannel: VoiceChannel, CurrentChannel: VoiceChannel]
 * ```ts
 * class EventRouter {
 *
 *  @Event(WatsonEvent.VoiceChannelChange)
 *  onVoiceChannelChange(
 *    previous: VoiceChannel,
 *    ctx: ExecutionContext,
 *    current: VoiceChannel) {
 *  }
 * }
 * ```
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
