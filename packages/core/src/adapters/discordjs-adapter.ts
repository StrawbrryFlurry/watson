import { ActivityOptions, Client, ClientEvents, ClientOptions } from 'discord.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { EventProxy } from '../event';
import { RuntimeException } from '../exceptions';

export class DiscordJSAdapter {
  private token: string;
  private client: Client;
  private clientOptions: ClientOptions;
  private activity: ActivityOptions;
  private eventSubscriptions = new Map<EventProxy<any>, Subscription>();
  public ready = new BehaviorSubject<boolean>(false);

  /**
   * Constructs a DiscordJS adapter
   * @param token Discord API token
   */
  constructor(client: Client);
  constructor(token: string, options: ClientOptions);
  constructor(token: string | Client, options?: ClientOptions) {
    if (token instanceof Client) {
      this.client = token;
    } else {
      this.token = token;
      this.clientOptions = options;
    }
  }

  public initialize() {
    this.client = this.createClientInstance();
  }

  private createClientInstance() {
    return this.client || new Client(this.clientOptions || {});
  }

  public async start() {
    this.initialize();
    this.registerDefaultListeners();
    await this.client.login(this.token);
  }

  public async stop() {
    this.client.destroy();
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

  public registerEventProxy<E extends keyof ClientEvents>(
    commandProxy: EventProxy<E>
  ) {
    const observable = this.createListener(commandProxy.eventType);
    const subscriber = observable.subscribe((eventData) =>
      commandProxy.proxy(...eventData)
    );

    this.eventSubscriptions.set(commandProxy, subscriber);
    return subscriber;
  }

  /**
   * Subscribe to a DiscordJS event. The observable emits each time the event occurs.
   * @param name name of the event
   * @return event observable
   */
  public createListener<E extends keyof ClientEvents>(
    event: E
  ): Observable<ClientEvents[E]> {
    return new Observable((subscriber) => {
      this.client.on(event, (...args) => {
        subscriber.next(args);
      });
    });
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

  private setUserActivity() {
    if (this.ready.value !== true) {
      return;
    }

    if (typeof this.activity !== "undefined") {
      this.client.user.setActivity(this.activity);
    } else {
      this.client.user.setActivity();
    }
  }
}
