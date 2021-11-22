import { AdapterRef } from '@core/adapters';
import { Injector, InjectorGetResult } from '@core/di';
import {
  BaseRoute,
  CommandPipeline,
  ContextType,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  InteractionPipeline,
  PipelineBase,
  Providable,
  Type,
} from '@watsonjs/common';
import { Client } from 'discord.js';

export class ExecutionContextImpl<
  PipelineHost extends
    | CommandPipeline
    | EventPipeline
    | InteractionPipeline = PipelineBase
> implements ExecutionContext, Injector
{
  public handler: Function;
  public next: Function;
  public route: BaseRoute;
  public adapter: AdapterRef;
  public parent: Injector;

  private pipeline: PipelineHost;

  constructor(pipeline: PipelineHost) {
    this.pipeline = pipeline;
  }

  public get<T extends Providable, R extends InjectorGetResult<T>>(
    typeOrToken: T
  ): Promise<R> {
    return this.parent.get(typeOrToken);
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

  public switchToEvent(): EventPipeline {
    throw new Error("Method not implemented.");
  }

  public getType<T extends string = ContextType>(): T {
    return this.pipeline.contextType as T;
  }

  public getEvent(): PipelineHost["eventData"] {
    return this.pipeline.getEvent();
  }

  public getRoute(): BaseRoute {
    return this.route;
  }
}
