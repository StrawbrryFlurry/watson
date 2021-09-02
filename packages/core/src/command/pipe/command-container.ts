import { CommandRoute, isString, Prefix } from '@watsonjs/common';
import iterate from 'iterare';

import { EventTokenFactory } from './event-token-factory';

export class CommandContainer extends Map<
  /* RouteToken */ string,
  CommandRoute
> {
  public readonly commands = new Map<
    /* Command alias */ string,
    /* Route Token */ string
  >();

  constructor(private _tokenFactory = new EventTokenFactory()) {
    super();
  }

  public apply(route: CommandRoute): void {
    const { name, alias, isSubCommand } = route;

    /**
     * Don't process sub commands
     * as they will be mapped by their parent
     */
    if (isSubCommand) {
      return;
    }

    const token = this._tokenFactory.create(route);
    this.set(token, route);

    this.commands.set(name, token);

    if (alias.length === 0) {
      return;
    }

    for (let i = 0; i < alias.length; i++) {
      const name = alias[i];
      this.commands.set(name, token);
    }
  }

  public remove(route: CommandRoute): void;
  public remove(id: string): void;
  public remove(route: CommandRoute | string) {
    const cleanupNames = (route: CommandRoute) => {
      const { name, alias } = route;
      const names = [...alias, name];

      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        this.commands.delete(name);
      }
    };

    if (isString(route)) {
      const routeRef = this.get(route);
      cleanupNames(routeRef);
      return this.delete(route);
    }

    cleanupNames(route);
    const token = this._tokenFactory.get(route);
    this.delete(token);
  }

  public getAll() {
    return iterate(this.entries()).toArray();
  }

  public getPrefixes(): Prefix[] {
    const prefixes: Prefix[] = [];
    for (const [name, token] of this.commands.entries()) {
      const { commandPrefix } = this.get(token);
      prefixes.push(commandPrefix);
    }

    return prefixes;
  }
}
