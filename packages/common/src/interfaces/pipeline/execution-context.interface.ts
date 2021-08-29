import { DiscordAdapter } from '@interfaces';
import { Base, Client } from 'discord.js';

import { BaseRoute, CommandPipeline, ContextType, EventPipeline, PipelineHost, SlashPipeline } from '..';
import { Type } from '../type.interface';

/**
 * The ExecutionContext holds all relevant information
 * about the current command / event route invocation it
 * belongs to.
 */
export abstract class ExecutionContext implements PipelineHost {
  /**
   * Returns the receiver from which this
   * context originated
   */
  public abstract getClass<T extends Type<any>>(): T;
  /**
   * Returns the next handler function for this context
   */
  public abstract getNext(): Function;
  /**
   * Returns the handler function in the receiver whose
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

  /** @PipelineHost */
  public abstract switchToCommand(): CommandPipeline;
  public abstract switchToSlash(): SlashPipeline;
  public abstract switchToEvent(): EventPipeline;
  public abstract getType<T extends string = ContextType>(): T;
  public abstract getRoute(): BaseRoute;
}
