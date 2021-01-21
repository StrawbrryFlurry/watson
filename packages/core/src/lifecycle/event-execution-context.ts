import { ContextDataTypes, ContextEventTypes, ExecutionContext, Type, ValuesOf } from '@watsonjs/common';
import { DiscordJSAdapter } from 'adapters';
import { Base as DjsBaseClass, Client, ClientEvents } from 'discord.js';

import { EventRoute } from '../routes';
import { WatsonContainer } from '../watson-container';

type ParsedEventData<K extends keyof ClientEvents = any> = {
  [P in ValuesOf<ClientEvents[K]>]: InstanceType<ClientEvents[K][P]>;
};

export class EventExecutionContext<
  CtxData extends ContextDataTypes = ContextDataTypes,
  CtxEventType extends ContextEventTypes = ContextEventTypes,
  EventData extends DjsBaseClass[] = any
> implements ExecutionContext<CtxData, CtxEventType> {
  public readonly container: WatsonContainer;
  public readonly client: Client;
  private contextData: CtxData;
  private readonly eventRoute: EventRoute<any>;
  private readonly eventData: EventData;
  private readonly contextType: CtxEventType;
  private parsedEventData: ParsedEventData;
  public readonly adapter: DiscordJSAdapter;

  constructor(
    ctxType: CtxEventType,
    eventData: EventData,
    route: EventRoute<any>,
    adapter: DiscordJSAdapter,
    container: WatsonContainer
  ) {
    this.adapter = adapter;
    this.contextType = ctxType;
    this.eventData = eventData;
    this.eventRoute = route;
    this.container = container;
    this.client = eventData[0]?.client;

    this.parseEventData();
  }

  public getEvent<T extends keyof ClientEvents>(): ClientEvents[T] {
    return (this.eventData as any) as ClientEvents[T];
  }

  public getEventObj<T extends Type>(): { [key: string]: InstanceType<T> };
  public getEventObj<T extends Type>(name: string): InstanceType<T>;
  public getEventObj<
    K extends keyof ClientEvents,
    N extends keyof ParsedEventData<K>
  >(name?: N) {
    if (name) {
      return this.parsedEventData[name];
    }

    return this.parsedEventData;
  }

  public getContextData<T>(): T {
    return (this.contextData as any) as T;
  }

  public getType(): CtxEventType {
    return this.contextType;
  }

  public getRoute<T>() {
    return (this.eventRoute as any) as T;
  }

  public getAdapter<T extends any = DiscordJSAdapter>(): T {
    return this.adapter as T;
  }

  public getClient(): Client {
    return this.adapter.getClient();
  }

  private parseEventData() {
    this.parsedEventData = {};

    for (const data of this.eventData) {
      this.parsedEventData[data.constructor.name.toLowerCase()] = data;
    }
  }

  public applyTransformation(data: Partial<CtxData>) {
    this.contextData = data as CtxData;
  }
}
