import { Client, ClientEvents } from "discord.js";
import { Observable } from "rxjs";

export class Injector {
  constructor() {}

  resolveClassDependencies() {}
}

declare function _fn<T extends keyof ClientEvents>(args: T): ClientEvents[T];

const fn = <T extends keyof ClientEvents>(event: T) => {
  return new Observable((subscriber) => {
    const y = _fn(event);
    subscriber.next(...y);
  });
};
