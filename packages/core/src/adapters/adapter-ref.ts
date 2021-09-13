import { DiscordAdapter, IWSEvent, RuntimeException, WatsonEvent } from '@watsonjs/common';
import { ActivityOptions } from 'discord.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ApplicationConfig } from '../application-config';
import { EventProxy } from '../lifecycle';

export abstract class AdapterRef<Client = any, Options = any>
  implements DiscordAdapter<Client>
{
  protected activity: ActivityOptions;

  protected configuration: ApplicationConfig;

  protected eventSubscriptions = new Map<
    EventProxy,
    { subscription: Subscription; observable: Observable<any> }
  >();

  public ready = new BehaviorSubject<boolean>(false);
  protected slashCommandAdapter: SlashCommandAdapter;

  constructor(configuration: ApplicationConfig) {
    this.configuration = configuration;
  }

  public abstract initialize(): Promise<void>;
  protected abstract initializeSlashCommands(): Promise<void>;

  protected abstract parseEvent(event: WatsonEvent): string;

  protected abstract setUserActivity(): Promise<void>;
  protected abstract login(): Promise<void>;
  protected abstract destroy(): void;

  /**
   * Creates a listener for the client instance.
   * @param name name of the event
   * @return event observable
   */
  public abstract registerListener<T, E extends WatsonEvent>(
    event: E
  ): Observable<T | [T]>;

  /**
   * Creates a listener on the websocket of the client.
   * @param name name of the event
   * @return event observable
   */
  public abstract registerWsListener<T extends {}, E extends WatsonEvent>(
    event: E
  ): Observable<IWSEvent<T>>;

  public registerEventProxy<E extends WatsonEvent>(eventProxy: EventProxy<E>) {
    const observable = eventProxy.isWSEvent
      ? this.registerWsListener(eventProxy.eventType)
      : this.registerListener(eventProxy.eventType);

    const subscriber = observable.subscribe((value) => eventProxy.proxy(value));

    this.eventSubscriptions.set(eventProxy, {
      observable: observable,
      subscription: subscriber,
    });

    return subscriber;
  }

  public get client(): Client {
    return this.configuration.clientInstance;
  }

  public set client(instance: Client) {
    this.configuration.setClientInstance(instance);
  }

  public async start() {
    await this.initialize();
    this.registerDefaultListeners();
    await this.login();
    await this.initializeSlashCommands();
  }

  public async stop() {
    for (const [proxy, { subscription }] of this.eventSubscriptions.entries()) {
      subscription.unsubscribe();
    }

    await this.destroy();
    this.ready.next(false);
  }

  public getClient() {
    return this.client;
  }

  public setClient(client: Client) {
    if (this.ready.value === true) {
      throw new RuntimeException("The client cannot be set while it's running");
    }

    this.client = client;
  }

  public getActivity(): ActivityOptions {
    return this.activity;
  }

  public get token() {
    return this.configuration.authToken;
  }

  protected get clientOptions(): Options {
    return this.configuration.clientOptions as Options;
  }

  public setActivity(options: ActivityOptions) {
    this.activity = options;
    return this.setUserActivity();
  }

  public async removeActivity() {
    this.activity = undefined;
    return this.setUserActivity();
  }

  private registerStateListener() {
    this.registerListener(WatsonEvent.CLIENT_READY).subscribe(() => {
      this.ready.next(true);
      this.setUserActivity();
    });
  }

  private registerDefaultListeners() {
    this.registerStateListener();
  }
}
