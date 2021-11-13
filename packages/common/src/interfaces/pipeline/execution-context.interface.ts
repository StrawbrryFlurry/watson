import { DIProvided, InjectionToken } from '@common/di';
import { DiscordAdapter } from '@common/interfaces';
import { Base, Client } from 'discord.js';

import { BaseRoute, CommandPipeline, ContextType, EventPipeline, InteractionPipeline, PipelineHost } from '..';
import { Type } from '../type.interface';

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
export abstract class ExecutionContext
  extends DIProvided({ providedIn: "ctx" })
  implements PipelineHost
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
  public abstract switchToEvent(): EventPipeline;
  public abstract getType<T extends string = ContextType>(): T;
  public abstract getRoute(): BaseRoute;
}
