import { AdapterRef } from '@core/adapters';
import {
  BaseRoute,
  CommandPipeline,
  ContextType,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  InteractionPipeline,
  PipelineBase,
} from '@watsonjs/common';
import { Injector, InjectorGetResult, Providable, Type } from '@watsonjs/di';
import { Client, ClientEvents } from 'discord.js';

export class ExecutionContextImpl<
  PipelineHost extends
    | CommandPipeline
    | EventPipeline<any>
    | InteractionPipeline = PipelineBase
> implements ExecutionContext, Injector
{
  public handler: Function;
  public next: Function;
  public route: BaseRoute;
  public adapter: AdapterRef;
  public parent: Injector;

  private _pipeline: PipelineHost;

  constructor(pipeline: PipelineHost) {
    this._pipeline = pipeline;
    this.parent = pipeline.router;
  }

  public get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): Promise<R> {
    return this.parent.get(typeOrToken);
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
    return this.adapter.client;
  }

  public getAdapter(): DiscordAdapter {
    return this.adapter as DiscordAdapter;
  }

  public switchToCommand(): CommandPipeline {
    return <CommandPipeline>this._pipeline;
  }

  public switchToEvent<T extends keyof ClientEvents>(): EventPipeline<T> {
    return <EventPipeline<T>>this._pipeline;
  }

  public switchToInteraction(): InteractionPipeline {
    return <InteractionPipeline>this._pipeline;
  }

  public getType<T extends string = ContextType>(): T {
    return this._pipeline.contextType as T;
  }

  public getEvent(): PipelineHost["eventData"] {
    return this._pipeline.getEvent();
  }

  public getRoute(): BaseRoute {
    return this.route;
  }
}
