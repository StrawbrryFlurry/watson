import { IPrefix, isNil } from '@watsonjs/common';
import iterate from 'iterare';

import { CommandRoute } from '../../router';
import { CommandPrefixHost } from '../../router/command/command-prefix-host';
import { CommandTokenFactory } from '../../util';

export class CommandContainer extends Map<string, CommandRoute> {
  constructor(private commandTokenFactory = new CommandTokenFactory()) {
    super();
  }

  public apply(route: CommandRoute) {
    const token = this.commandTokenFactory.create(route);

    if (this.has(token)) {
      return;
    }

    this.set(token, route);
  }

  public getCommandByName(name: string, prefix?: string) {
    return isNil(prefix)
      ? this.commands.find((route) => route.hasName(name))
      : this.commands.find(
          (route) => route.hasName(name) && route.prefix === prefix
        );
  }

  public getPrefixesAsArray(): IPrefix[] {
    return iterate(this.getPrefixes()).toArray();
  }

  public getPrefixes(): Set<CommandPrefixHost> {
    return iterate(this)
      .map(([_, route]) => route.commandPrefix)
      .reduce((prefixes, prefix) => {
        prefixes.add(prefix);
        return prefixes;
      }, new Set());
  }

  public getCommandsMap(): Map<string, string> {
    const commands = new Map<string, string>();

    for (const [id, route] of this) {
      const { name, alias } = route;

      commands.set(name, id);

      for (const aliasName of alias) {
        commands.set(aliasName, id);
      }
    }

    return commands;
  }

  public get commands() {
    return iterate(this)
      .toArray()
      .map(([id, route]) => route);
  }
}
