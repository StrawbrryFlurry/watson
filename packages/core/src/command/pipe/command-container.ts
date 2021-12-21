import { CommandRoute, isString } from '@watsonjs/common';
import { Injectable } from '@watsonjs/di';
import iterate from 'iterare';

@Injectable({ providedIn: "root" })
export class CommandContainer extends Map<string, CommandRoute> {
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

    this.set(name, routeRef);

    if (alias.length === 0) {
      return;
    }

    for (let i = 0; i < alias.length; i++) {
      const name = alias[i];
      this.set(name, routeRef);
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
        this.delete(name);
      }
    };

    if (isString(route)) {
      const routeRef = this.get(route);
      cleanupNames(routeRef!);
      return this.delete(route);
    }

    cleanupNames(route);
  }

  public getAll() {
    return iterate(this.entries()).toArray();
  }
}
