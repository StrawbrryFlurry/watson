
import { Client, ClientEvents, Message } from "discord.js";
import { Observable, Subject } from "rxjs";

export class DiscordJSAdapter {

    private token: string;
    private client: Client;

    private subReady: Subject<void>;
    public onReady: Observable<void>;
    private subMessage: Subject<Message>;
    public onMessage: Observable<Message>;

    constructor(token: string) {
        this.token = token;

        this.subReady = new Subject();
        this.onReady = this.subReady.asObservable();
        this.subMessage = new Subject();
        this.onMessage = this.subMessage.asObservable();
    }

    initialize() {
        this.client = new Client();
        this.client.login(this.token);

        this.client.on('ready', () => {
            this.bindEvents();
            this.subReady.next();
        });
    }

    onEvent<K extends keyof ClientEvents>(name: K): Observable<ClientEvents[K]> {
        return new Observable((sub) => {
            this.client.on(name, (...args) => {
                sub.next(args);
            });
        });
    }

    private bindEvents() {
        this.client.on('message', (msg) => this.subMessage.next(msg));
    }
}

