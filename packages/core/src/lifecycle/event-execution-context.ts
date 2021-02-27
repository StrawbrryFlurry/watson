import {
  BaseRoute,
  ContextType,
  DiscordAdapter,
  EventPipeline,
  ExecutionContext,
  SlashPipeline,
  Type,
} from '@watsonjs/common';
import { Base as DjsBaseClass, Client } from 'discord.js';

import { DiscordJSAdapter } from '../adapters';
import { CommandPipelineHost } from '../command';
import { AbstractRoute } from '../router';

export class ExecutionContextHost<
  PipelineHost extends
    | CommandPipelineHost
    | EventPipeline
    | SlashPipeline = any,
  EventData extends DjsBaseClass[] = any
> implements ExecutionContext {
  public handler: Function;
  public next: Function;
  public route: AbstractRoute;
  public adapter: DiscordJSAdapter;
  public contextType: string;
  public eventData: EventData;

  private pipeline: PipelineHost;

  constructor(
    pipeline: PipelineHost,
    eventData: EventData,
    contextType: ContextType,
    route: AbstractRoute,
    adapter: DiscordJSAdapter
  ) {
    this.pipeline = pipeline;
    this.adapter = adapter;
    this.eventData = eventData;
    this.contextType = contextType;
    this.route = route;
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

  public getEvent<T = unknown[]>(): T {
    return this.eventData as any;
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
    return this.contextType as T;
  }

  public getRoute(): BaseRoute {
    return this.route;
  }
}
