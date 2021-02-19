import { RuntimeException } from '@watsonjs/common';
import { ActivityOptions, ClientEvents } from 'discord.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { EventProxy } from '../lifecycle';
import { SlashCommandAdapter } from './slash-adapter';
import { WatsonDiscordMessage } from './types';

export abstract class AbstractDiscordAdapter<
  TClient = any,
  TOptions = any,
  TMessage = any
> {
  protected token: string;
  protected client: TClient;

  protected clientOptions: TOptions;
  protected activity: ActivityOptions;

  protected eventSubscriptions = new Map<
    EventProxy<any>,
    { sub: Subscription; obsv: Observable<any> }
  >();

  public ready = new BehaviorSubject<boolean>(false);

  protected slashCommandAdapter: SlashCommandAdapter;

  public abstract init(): Promise<void>;
  public abstract initializeSlashCommands(): Promise<void>;

  public abstract createWatsonMessage(message: TMessage): WatsonDiscordMessage;

  protected abstract setUserActivity(): void;
  protected abstract login(): Promise<void>;
  protected abstract destroy(): Promise<void>;

  /**
   * Subscribe to a DiscordJS event. The observable emits each time the event occurs.
   * @param name name of the event
   * @return event observable
   */
  public abstract createListener<E extends keyof ClientEvents>(
    event: E
  ): Observable<ClientEvents[E]>;

  /**
   * Subscribe to a Websocket event on the DiscordJS client. The observable emits each time the event occurs.
   * @param name name of the event
   * @return event observable
   */
  public abstract createWSListener<T extends {}, E extends string>(
    event: E
  ): Observable<any>;

  public registerEventProxy<E extends keyof ClientEvents>(
    eventProxy: EventProxy<E>
  ) {
    const observable = eventProxy.isWSEvent
      ? this.createWSListener(eventProxy.eventType)
      : this.createListener(eventProxy.eventType);

    const subscriber = observable.subscribe((observer) =>
      eventProxy.proxy(this as any, observer)
    );

    this.eventSubscriptions.set(eventProxy, {
      obsv: observable,
      sub: subscriber,
    });

    return subscriber;
  }

  public async start() {
    await this.init();
    this.registerDefaultListeners();
    await this.login();
    await this.initializeSlashCommands();
  }

  public async stop() {
    for (const [proxy, { sub }] of this.eventSubscriptions.entries()) {
      sub.unsubscribe();
    }

    await this.destroy();
    this.ready.next(false);
  }

  public getClient() {
    return this.client;
  }

  public setClient(client: TClient) {
    if (this.ready.value === true) {
      throw new RuntimeException("The client cannot be set while it's running");
    }

    this.client = client;
  }

  public setAuthToken(token: string) {
    this.token = token;
  }

  public setActivity(options: ActivityOptions) {
    this.activity = options;
    this.setUserActivity();
  }

  public async removeActivity() {
    this.activity = undefined;

    this.setUserActivity();
  }

  private registerStateListener() {
    this.createListener("ready").subscribe(() => {
      this.ready.next(true);
      this.setUserActivity();
    });
  }

  private registerDefaultListeners() {
    this.registerStateListener();
  }
}
