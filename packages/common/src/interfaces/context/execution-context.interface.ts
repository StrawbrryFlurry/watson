import { Client, ClientEvents } from 'discord.js';

import { IClientEvent } from '../client-events.interface';
import { Type } from '../type.interface';
import { CommandContextData } from './command-context-data.interface';
import { EventContextData } from './event-context-data.interface';
import { SlashContextData } from './slash-context-data';

export type ContextEventTypes = "event" | "command" | "slash";
export type ContextDataTypes =
  | CommandContextData
  | SlashContextData
  | EventContextData;

export interface ExecutionContext<
  ContextData extends ContextDataTypes = ContextDataTypes,
  ContextType extends ContextEventTypes = ContextEventTypes,
  EventType extends IClientEvent = IClientEvent
> {
  /**
   * @returns the current context data present for the event.
   * Depending on the context type you can apply one of the following interfaces as a generic:
   * @interface EventContextData
   * Use this interface for Event handlers
   * @interface CommandContextData
   * Use this interface for Command handlers
   * @interface SlashContextData
   * Use this interface for Slash Command handlers
   */
  getContextData<T = any>(): T;

  /**
   * @returns the base event emitted by the client.
   * Use a generic to fit what you exprect to get from the event e.g.
   *```
   * `@Event('message')`
   * handleMessage(`@Context() ctx: ExecutionContext`) {
   *  const [message] = ctx.getEvent<'message'>();
   * }
   * ```
   */
  getEvent<T extends keyof ClientEvents>(): ClientEvents[T];

  /**
   * @param name The name of the instance to return in lowercase
   * @returns a parsed object of the client event data.
   * @key The full lowercase name of the type.
   * If a name is provided the value of the object with that name is returned instead
   * @value The instance of that type
   * ```
   * `@Event('message)`
   *  handleMessage(`@Context() ctx: ExecutionContext`) {
   *    const message = ctx.getEventObj('message');
   *    const { message } = ctx.getEventObj();
   *  }
   * ```
   */
  getEventObj<T extends Type>(): { [key: string]: InstanceType<T> };
  getEventObj<T extends Type>(name: string): InstanceType<T>;

  /**
   * @returns the event type of this context:
   * @type `command`
   * For a command execution context
   * @type `slash`
   * For a slash command execution context
   * @type `event`
   * For a generic event execution context
   */
  getType(): ContextType;

  /**
   * @returns The Watson client adapter instance
   */
  getAdapter<T extends any = any>(): T;

  /**
   * @returns The client that has emitted the event.
   */
  getClient(): Client;

  /**
   * Returns the event route that matched this event.
   *
   * @example
   * For commands use the `CommandRoute` interface from `@watsonjs/core`
   *
   * @example
   * For events use the `ConcreteEventRoute` interface from`@watsonjs/core`
   *
   * @example
   * For slash commands use the `SlashRoute` interface from `@watsonjs/core`
   */
  getRoute<T = any>(): T;
}
