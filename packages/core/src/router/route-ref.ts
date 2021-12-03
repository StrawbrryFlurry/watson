import { RouterRef } from '@core/router';
import { BaseRoute, ContextType, Type, WatsonEvent } from '@watsonjs/common';

/**
 * Represents a route of any type
 * that can handle an event registered
 * in the application.
 */
export abstract class RouteRef<Event extends WatsonEvent = any>
  implements BaseRoute
{
  /**
   * The type of the Execution
   * context:
   * - "slash"
   * - "event"
   * - "command"
   */
  public readonly type: ContextType;
  /**
   * The event type this route will map to
   * @example
   * `WatsonEvent.MESSAGE_CREATE`
   */
  public readonly event: Event;
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @core/command, @Event
   */
  public abstract readonly handler: Function;
  /**
   * The host router that this route was registered in
   */
  public abstract readonly host: RouterRef;

  public get metatype() {
    return this.host.metatype;
  }

  constructor(type: ContextType, event: Event) {
    this.type = type;
    this.event = event;
  }

  public getType<T extends string = ContextType>(): T {
    return this.type as T;
  }

  public getHandler(): Function {
    return this.handler;
  }

  public getHost<T extends Type<any>>(): T {
    return this.host.instance as T;
  }

  public getEvent(): Event {
    return this.event;
  }
}
