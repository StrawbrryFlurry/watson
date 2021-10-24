import { AdapterRef } from '@core/adapters';
import { Injector, InjectorGetResult } from '@core/di';
import {
  BaseRoute,
  CommandPipeline,
  ContextType,
  DIProvided,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  InteractionPipeline,
  PipelineBase,
  Type,
} from '@watsonjs/common';
import { Client } from 'discord.js';

export class ExecutionContextImpl<
    PipelineHost extends
      | CommandPipeline
      | EventPipeline
      | InteractionPipeline = PipelineBase,
    EventData extends unknown[] = any
  >
  extends DIProvided({ providedIn: "ctx" })
  implements ExecutionContext, Injector
{
  public handler: Function;
  public next: Function;
  public route: BaseRoute;
  public adapter: AdapterRef;
  public eventData: EventData;
  public parent: Injector | null;

  private pipeline: PipelineHost;

  constructor(
    pipeline: PipelineHost,
    eventData: EventData,
    route: BaseRoute,
    adapter: AdapterRef,
    next?: Function
  ) {
    super();
    this.pipeline = pipeline;
    this.adapter = adapter;
    this.eventData = eventData;
    this.route = route;
    this.next = next!;
  }
  public get<T extends unknown, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): any {
    throw new Error("Method not implemented.");
  }

  public switchToInteraction(): InteractionPipeline {
    throw new Error("Method not implemented.");
  }

  public setNext(nextFn: Function) {
    this.next = nextFn;
  }

  public getClass<T extends Type<any>>(): T {
    return this.route.host.instance as T;
  }

  public getNext(): Function {
    return this.next;
  }

  public getHandler(): Function {
    return this.handler;
  }

  public getClient(): Client {
    return this.adapter.getClient();
  }

  public getAdapter(): DiscordAdapter {
    return this.adapter as DiscordAdapter;
  }

  public switchToCommand(): CommandPipeline {
    return this.pipeline as CommandPipeline;
  }

  public switchToSlash(): InteractionPipeline {
    throw new Error("Method not implemented.");
  }

  public switchToEvent(): EventPipeline {
    throw new Error("Method not implemented.");
  }

  public getType<T extends string = ContextType>(): T {
    return this.pipeline.contextType as T;
  }

  public getEvent<T, R = T extends Array<any> ? T : [T]>(): R {
    return this.eventData as any as R;
  }

  public getRoute(): BaseRoute {
    return this.route;
  }

  /**
   * Removes all properties from the context
   * so that it cannot be used any further
   *
   * @warn
   * This method should only be called by the
   * `ResponseController` and only after the
   * event life cycle has finished!
   */
  public _destroy() {
    Object.keys(this).forEach((k) => delete this[k]);
  }
}
