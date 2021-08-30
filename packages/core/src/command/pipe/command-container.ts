import { CommandRoute, isString, Prefix } from '@watsonjs/common';

import { EventTokenFactory } from './event-token-factory';

export class CommandContainer extends Map<
  /* RouteToken */ string,
  CommandRoute
> {
  /**
   * Holds the same routes as the map
   * but allows for faster iteration trough
   * all entries than using iterators.
   */
  private _routes: CommandRoute[] = [];
  /**
   * Don't touch this..
   *
   * Saves the array index of a given route
   * in `_routes`
   */
  private __routeIdx = new Map<string, number>();

  constructor(private _tokenFactory = new EventTokenFactory()) {
    super();
  }

  public apply(route: CommandRoute) {
    const token = this._tokenFactory.create(route);
    this.set(token, route);
    const arrayIdx = this._routes.push(route) - 1;
    this.__routeIdx.set(token, arrayIdx);
  }

  public remove(route: CommandRoute): void;
  public remove(id: string): void;
  public remove(route: CommandRoute | string) {
    if (isString(route)) {
      const arrayIdx = this.__routeIdx.get(route);
      this._routes.splice(arrayIdx, 1);
      return this.delete(route);
    }

    const token = this._tokenFactory.get(route);
    this.delete(token);
    const arrayIdx = this.__routeIdx.get(token);
    this._routes.splice(arrayIdx, 1);
  }

  public getCommandByName(nameOrAlias: string, prefix: string = "") {
    throw "Not implemented yet";
  }

  public getPrefixes(): Prefix[] {
    const prefixes: Prefix[] = [];
    for (let i = 0; i < this._routes.length; i++) {
      const { commandPrefix } = this._routes[i];
      prefixes.push(commandPrefix);
    }

    return prefixes;
  }

  public getCommandsMap(): Map<string, string> {
    const commands = new Map<string, string>();

    for (let i = 0; i < this._routes.length; i++) {
      const route = this._routes[i];
      const routeToken = this._tokenFactory.get(route);
      const { name, alias } = route;
      commands.set(name.toLowerCase(), routeToken);

      if (alias.length === 0) {
        continue;
      }

      for (let y = 0; y < alias.length; y++) {
        const name = alias[y];
        commands.set(name, routeToken);
      }
    }

    return commands;
  }
}
