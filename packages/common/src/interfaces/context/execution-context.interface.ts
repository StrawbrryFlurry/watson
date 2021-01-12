import { ConditionalAny } from 'utils';

import { CommandContextData } from './command-context-data';
import { EventContextData } from './event-context-data';
import { SlashContextData } from './slash-context-data';

export type ContextEventTypes = "event" | "command" | "slash";
export type ContextDataTypes =
  | CommandContextData
  | SlashContextData
  | EventContextData;

export interface ExecutionContext<
  ContextData extends ContextDataTypes = ContextDataTypes,
  EventType extends ContextEventTypes = ContextEventTypes
> {
  /**
   * Returns the current context data present for the event.
   * Depending on the context type you can apply one of the following interfaces as a generic:
   * @interface EventContextData
   * Use this interface for Event handlers
   * @interface CommandContextData
   * Use this interface for Command handlers
   * @interface SlashContextData
   * Use this interface for Slash Command handlers
   */
  getContextData<T = any>(): ConditionalAny<ContextData, T>;
  /**
   * Returns the base event emitted by the client.
   * Use a generic to fit what you exprect to get from the event e.g.
   *```
   * \@Event('message')
   * handleMessage(@Context() ctx: ExecutionContext) {
   *  const message = ctx.getEvent<Message>();
   * }
   * ```
   */
  getEvent<T = any>(): ConditionalAny<EventType, T>;

  getType(): EventType;
}
