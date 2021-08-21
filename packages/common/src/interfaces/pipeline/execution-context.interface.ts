import { DiscordAdapter } from '@interfaces/adapter';
import { Base, Client } from 'discord.js';

import { PipelineHost } from '..';
import { Type } from '../type.interface';

/**
 * The ExecutionContext holds all relevant information
 * about the current command / event route invocation it
 * belongs to.
 */
export interface ExecutionContext extends PipelineHost {
  /**
   * Returns the receiver from which this
   * context originated
   */
  getClass<T extends Type<any>>(): T;
  /**
   * Returns the next handler function for this context
   */
  getNext(): Function;
  /**
   * Returns the handler function in the receiver whose
   * whose decorator registered the route this context
   * originated from.
   */
  getHandler(): Function;
  /**
   * Returns the raw event data as an array
   */
  getEvent<T, R = T extends Array<Base> ? T : [T]>(): R;
  /**
   * Returns the client that has emitted the event.
   */
  getClient(): Client;
  /**
   * Returns the Watson DiscordAdapter instance
   */
  getAdapter(): DiscordAdapter;
}
