import { DiscordAdapter } from "@common/adapter";
import { BaseRoute } from "@common/router";
import { Injectable, InjectionToken, Type } from "@watsonjs/di";
import { Base, Client, ClientEvents } from "discord.js";

import { CommandPipeline } from "./command-pipeline.interface";
import { ContextType } from "./context-type.enum";
import { EventPipeline } from "./event-pipeline.interface";
import { InteractionPipeline } from "./interaction-pipeline.interface";
import { PipelineHost } from "./pipeline-host.interface";

type InjectorGetResult<T> = T extends InjectionToken<infer R>
  ? R
  : T extends new (...args: any[]) => infer R
  ? R
  : never;

/**
 * The ExecutionContext holds all relevant information
 * about the current command / event route invocation it
 * belongs to.
 */
@Injectable({ providedIn: "ctx" })
export abstract class ExecutionContext<
  E extends keyof ClientEvents = keyof ClientEvents
> implements PipelineHost
{
  /**
   * Returns the router from which this
   * context originated
   */
  public abstract getClass<T extends Type<any>>(): T;
  /**
   * Returns the next handler function for this context
   */
  public abstract getNext(): Function;
  /**
   * Returns the handler function in the router whose
   * whose decorator registered the route this context
   * originated from.
   */
  public abstract getHandler(): Function;
  /**
   * Returns the raw event data as an array
   */
  public abstract getEvent<T, R = T extends Array<Base> ? T : [T]>(): R;
  /**
   * Returns the client that has emitted the event.
   */
  public abstract getClient(): Client;
  /**
   * Returns the Watson DiscordAdapter instance
   */
  public abstract getAdapter(): DiscordAdapter;

  /** @Injector */
  public abstract get<
    T extends Type | InjectionToken,
    R extends InjectorGetResult<T>
  >(typeOrToken: T): Promise<R>;

  public abstract parent: any;

  /** @PipelineHost */
  public abstract switchToCommand(): CommandPipeline;
  public abstract switchToInteraction(): InteractionPipeline;
  public abstract switchToEvent(): EventPipeline<E>;
  public abstract getType<T extends string = ContextType>(): T;
  public abstract getRoute(): BaseRoute;
}
