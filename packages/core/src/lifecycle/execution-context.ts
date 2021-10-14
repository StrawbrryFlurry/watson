import { Injector, InjectorGetResult } from '@di';
import {
  ContextType,
  DIProvided,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  IBaseRoute,
  InteractionPipeline,
  PipelineBase,
  Type,
} from '@watsonjs/common';
import { Base as DjsBaseClass, Client } from 'discord.js';

import { AbstractDiscordAdapter } from '../adapters';
import { CommandPipelineHost } from '../command';
import { AbstractRoute } from '../router';

export class ExecutionContextImpl<
  PipelineHost extends
    | CommandPipelineHost
    | EventPipeline
    | InteractionPipeline = PipelineBase,
  EventData extends DjsBaseClass[] = any
> extends DIProvided({providedIn: 'ctx'})  implements ExecutionContext, Injector
{
  public handler: Function;
  public next: Function;
  public route: AbstractRoute;
  public adapter: AbstractDiscordAdapter;
  public eventData: EventData;
  public parent: Injector | null;

  private pipeline: PipelineHost;

  constructor(
    pipeline: PipelineHost,
    eventData: EventData,
    route: AbstractRoute,
    adapter: AbstractDiscordAdapter,
    next?: Function
  ) {
    super();
    this.pipeline = pipeline;
    this.adapter = adapter;
    this.eventData = eventData;
    this.route = route;
    this.next = next;
  }

  public async get<T extends unknown, R extends InjectorGetResult<T>>(typeOrToken: T): Promise<R> {
    throw new Error('Method not implemented.');
  }

  public switchToInteraction(): InteractionPipeline {
    throw new Error('Method not implemented.');
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

  public switchToCommand(): CommandPipelineHost {
    return this.pipeline as CommandPipelineHost;
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

  public getRoute(): IBaseRoute {
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
