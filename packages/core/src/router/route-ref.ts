import { BaseRoute, ContextType, ReceiverDef, Type, WatsonEvent } from '@watsonjs/common';

import { InstanceWrapper } from '../injector';
import { WatsonContainer } from '../watson-container';

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
   * The host receiver that this route was registered in
   */
  public abstract readonly host: InstanceWrapper<ReceiverDef>;
  public readonly container: WatsonContainer;

  constructor(type: ContextType, event: Event, container: WatsonContainer) {
    this.type = type;
    this.container = container;
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

  public getContainer<T = any>(): T {
    return this.container as unknown as T;
  }

  public getEvent(): Event {
    return this.event;
  }
}
