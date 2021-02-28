import {
  BaseRoute,
  ContextType,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  PipelineBase,
  SlashPipeline,
  Type,
} from '@watsonjs/common';
import { Base as DjsBaseClass, Client } from 'discord.js';

import { AbstractDiscordAdapter } from '../adapters';
import { CommandPipelineHost } from '../command';
import { AbstractRoute } from '../router';

export class ExecutionContextHost<
  PipelineHost extends
    | CommandPipelineHost
    | EventPipeline
    | SlashPipeline = PipelineBase,
  EventData extends DjsBaseClass[] = any
> implements ExecutionContext {
  public handler: Function;
  public next: Function;
  public route: AbstractRoute;
  public adapter: AbstractDiscordAdapter;
  public eventData: EventData;

  private pipeline: PipelineHost;

  constructor(
    pipeline: PipelineHost,
    eventData: EventData,
    route: AbstractRoute,
    adapter: AbstractDiscordAdapter,
    next?: Function
  ) {
    this.pipeline = pipeline;
    this.adapter = adapter;
    this.eventData = eventData;
    this.route = route;
    this.next = next;
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
    return this.adapter;
  }

  public switchToCommand(): CommandPipelineHost {
    return this.pipeline as CommandPipelineHost;
  }

  public switchToSlash(): SlashPipeline {
    throw new Error("Method not implemented.");
  }

  public switchToEvent(): EventPipeline {
    throw new Error("Method not implemented.");
  }

  public getType<T extends string = ContextType>(): T {
    return this.pipeline.contextType as T;
  }

  public getEvent<T, R = T extends Array<any> ? T : [T]>(): R {
    return (this.eventData as any) as R;
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
