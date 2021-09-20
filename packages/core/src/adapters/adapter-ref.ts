import { DiscordAdapter, IWSEvent, RuntimeException, WATSON_ELEMENT_ID, WatsonEvent } from '@watsonjs/common';
import { ActivityOptions } from 'discord.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { ApplicationConfig } from '../application-config';
import { EventProxy } from '../lifecycle';

export abstract class AdapterRef<Client = any, Options = any>
  implements DiscordAdapter<Client>
{
  public static [WATSON_ELEMENT_ID] = 0;

  protected _activity: ActivityOptions | null;
  protected configuration: ApplicationConfig;
  protected eventSubscriptions = new Map<
    EventProxy,
    { subscription: Subscription; observable: Observable<any> }
  >();

  public ready = new BehaviorSubject<boolean>(false);

  constructor(configuration: ApplicationConfig) {
    this.configuration = configuration;
  }

  public abstract initialize(): Promise<void>;

  protected abstract parseEvent(event: WatsonEvent): string;

  protected abstract setUserActivity(): Promise<void>;
  protected abstract login(): Promise<void>;
  protected abstract destroy(): void;

  public abstract registerListener<T, E extends WatsonEvent>(
    event: E
  ): Observable<T | [T]>;

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
    return this.configuration.client;
  }

  public set client(instance: Client) {
    this.configuration.client = instance;
  }

  public async start() {
    await this.initialize();
    this.registerDefaultListeners();
    await this.login();
  }

  public async stop() {
    for (const [proxy, { subscription }] of this.eventSubscriptions.entries()) {
      subscription.unsubscribe();
    }

    await this.destroy();
    this.ready.next(false);
  }

  public setClient(client: Client) {
    if (this.ready.value === true) {
      throw new RuntimeException("The client cannot be set while it's running");
    }

    this.client = client;
  }

  public get activity(): ActivityOptions | null {
    return this.activity;
  }

  public get token() {
    return this.configuration.discordToken;
  }

  protected get clientOptions(): Options {
    return this.configuration.clientOptions as Options;
  }

  public setActivity(options: ActivityOptions) {
    this._activity = options ?? null;
    return this.setUserActivity();
  }

  public async removeActivity() {
    this._activity = null;
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
