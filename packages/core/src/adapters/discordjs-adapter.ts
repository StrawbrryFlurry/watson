
import { Client, ClientEvents, Message } from "discord.js";
import { Observable, Subject } from "rxjs";

export class DiscordJSAdapter {

    private token: string;
    private client: Client;

    private subReady: Subject<void>;
    public onReady: Observable<void>;
    private subMessage: Subject<Message>;
    public onMessage: Observable<Message>;

    /**
     * Constructs a DiscordJS adapter
     * @param token Discord API token
     */
    constructor(token: string) {
        this.token = token;

        this.subReady = new Subject();
        this.onReady = this.subReady.asObservable();
        this.subMessage = new Subject();
        this.onMessage = this.subMessage.asObservable();
    }

    /**
     * Instantiates the DiscordJS client with the provided token
     */
    initialize() {
        this.client = new Client();
        this.client.login(this.token);

        this.client.on('ready', () => {
            this.bindEvents();
            this.subReady.next();
        });
    }

    /**
     * Subscribe to a DiscordJS event. The observable emits each time the event occurs.
     * @param name name of the event
     * @return event observable
     */
    onEvent<K extends keyof ClientEvents>(name: K): Observable<ClientEvents[K]> {
        return new Observable((sub) => {
            this.client.on(name, (...args) => {
                sub.next(args);
            });
        });
    }

    /**
     * Binds discord js events internally
     * @internal
     */
    private bindEvents() {
        this.client.on('message', (msg) => this.subMessage.next(msg));
    }
}

