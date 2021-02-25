import { CommandPrefix, isNil } from '@watsonjs/common';
import iterate from 'iterare';

import { CommandTokenFactory } from '../../helpers';
import { CommandRoute } from '../../routes';

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

  public getPrefixesAsArray() {
    return iterate(this)
      .toArray()
      .map(([_, route]) => route.commandPrefix)
      .reduce((prefixes: CommandPrefix[], commandPrefix) => {
        const { prefix } = commandPrefix;

        if (isNil(prefix)) {
          return [...prefixes, commandPrefix];
        }

        const hasPrefix = prefixes.some((p) => p.prefix === prefix);

        if (hasPrefix) {
          return prefixes;
        }

        return [...prefixes, commandPrefix];
      }, []);
  }

  public getCommandsMap() {
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
