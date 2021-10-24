import { CommandRoute, DIProvided, isString } from '@watsonjs/common';
import iterate from 'iterare';

type CommandMapCtor = new (
  entries?: readonly (readonly [string, CommandRoute])[] | null
) => Map<string, CommandRoute>;

export class CommandContainer extends DIProvided(
  { providedIn: "root" },
  Map as CommandMapCtor
) {
  public apply(routeRef: CommandRoute): void {
    const { name, alias, isSubCommand } = routeRef;

    /**
     * Don't process sub commands
     * as they will be mapped
     * in the {@link RouteExplorer}
     */
    if (isSubCommand) {
      return;
    }

    this.commands.set(name, routeRef);

    if (alias.length === 0) {
      return;
    }

    for (let i = 0; i < alias.length; i++) {
      const name = alias[i];
      this.commands.set(name, routeRef);
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
      cleanupNames(routeRef!);
      return this.delete(route);
    }

    cleanupNames(route);
    const token = this._tokenFactory.get(route);
    this.delete(token!);
  }

  public getAll() {
    return iterate(this.entries()).toArray();
  }
}
