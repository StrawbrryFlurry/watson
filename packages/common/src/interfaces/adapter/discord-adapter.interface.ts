import { ActivityOptions } from 'discord.js';
import { BehaviorSubject, Observable } from 'rxjs';

import { WatsonEvent } from '../../enums';

export type IWSEvent<T extends {}> = [data: T, shardID: number];

export interface DiscordAdapter<Client = any> {
  /**
   * Fires after the client instance is ready
   */
  ready: BehaviorSubject<boolean>;
  /**
   * Returns the user activity
   */
  activity: ActivityOptions | null;
  /**
   * Discord client instance
   */
  client: Client;
  /**
   * Sets the user activity
   */
  setActivity(options: ActivityOptions): Promise<void>;
  /**
   * Removes the user activity
   */
  removeActivity(): Promise<void>;
  /**
   * You probably don't want to use this method
   */
  stop(): Promise<void>;
  /**
   * You probably don't want to use this method
   */
  start(): Promise<void>;
  /**
   * Creates a listener on the websocket of the client.
   * @param name name of the event
   * @return event observable
   */
  registerWsListener<T extends {}, E extends WatsonEvent>(
    event: E
  ): Observable<IWSEvent<T>>;
  /**
   * Creates a listener for the client instance.
   * @param name name of the event
   * @return event observable
   */
  registerListener<T, E extends WatsonEvent>(event: E): Observable<T | [T]>;
}
