import { RouterRef } from '@core/router';
import { BaseRoute, ContextType, WatsonEvent } from '@watsonjs/common';
import { MethodDescriptor } from '@watsonjs/di';

/**
 * Represents a route of any type
 * that can handle an event registered
 * in the application.
 */
export abstract class RouteRef<Event extends WatsonEvent = any>
  implements BaseRoute
{
  public readonly type: ContextType;
  public readonly event: Event;
  public readonly handler: Function;
  public readonly propertyKey: string;

  public abstract readonly host: RouterRef;

  public get metatype() {
    return this.host.metatype;
  }

  constructor(type: ContextType, event: Event, handler: MethodDescriptor) {
    this.type = type;
    this.event = event;
    this.handler = handler.descriptor;
    this.propertyKey = handler.propertyKey;
  }

  public getType<T extends string = ContextType>(): T {
    return this.type as T;
  }

  public getEvent(): Event {
    return this.event;
  }
}
