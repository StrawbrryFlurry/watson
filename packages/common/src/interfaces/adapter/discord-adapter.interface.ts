import { ActivityOptions } from 'discord.js';
import { BehaviorSubject, Observable } from 'rxjs';

import { WatsonEvent } from '../../enums';

export type IWSEvent<T extends {}> = [data: T, shardID: number];

export interface DiscordAdapter<TClient = any> {
  /**
   * Fires after the client instance is ready
   */
  ready: BehaviorSubject<boolean>;
  /**
   * Returns the user activity
   */
  getActivity(): ActivityOptions | undefined;
  /**
   * Sets the user activity
   */
  setActivity(options: ActivityOptions): Promise<void>;
  /**
   * Removes the user activity
   */
  removeActivity(): Promise<void>;
  /**
   * Returns the internal client instance
   */
  getClient(): TClient;
  /**
   * You probably don't want to use this method
   */
  stop(): Promise<void>;
  /**
   * You probably don't want to use this method
   */
  start(): Promise<void>;
  /**
   * Registers a websocket listener for the event
   * specified
   */
  registerWsListener<T extends {}, E extends WatsonEvent>(
    event: E
  ): Observable<IWSEvent<T>>;
  /**
   * Registers a listener for the event client event
   * specified
   */
  registerListener<T, E extends WatsonEvent>(event: E): Observable<T | [T]>;
}
