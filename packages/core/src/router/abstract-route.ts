import { ContextType, IBaseRoute, TReceiver, Type, WatsonEvent } from '@watsonjs/common';

import { InstanceWrapper } from '../injector';
import { WatsonContainer } from '../watson-container';

export abstract class AbstractRoute<Event extends WatsonEvent = any>
  implements IBaseRoute {
  /**
   * The type of the execution context Execution contexts be either "slash", event or "command"
   */
  public readonly type: ContextType;
  /**
   * The event name this route will map to
   * @example
   * `WatsonEvent.MESSAGE_CREATE`
   */
  public readonly event: Event;
  /**
   * The handler method descriptor whose decorator registered this route:
   * e.g @Command, @Event
   */
  public abstract readonly handler: Function;
  /**
   * The host receiver that this route was registered in
   */
  public abstract readonly host: InstanceWrapper<TReceiver>;
  public readonly container: WatsonContainer;

  constructor(type: ContextType, event: Event, container: WatsonContainer) {
    this.type = type;
    this.container = container;
    this.event = event;
  }

  getType(): ContextType {
    return this.type;
  }

  getHandler(): Function {
    return this.handler;
  }

  getHost<T extends Type<any>>(): T {
    return this.host.instance as T;
  }

  getContainer<T = any>(): T {
    return (this.container as unknown) as T;
  }

  getEvent(): Event {
    return this.event;
  }
}
