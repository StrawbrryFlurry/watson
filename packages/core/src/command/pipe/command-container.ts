import iterate from 'iterare';

import { CommandTokenFactory } from '../../helpers';
import { CommandRoute } from '../../routes';
import { DuplicateCommandImplementationException } from '../exceptions';

export class CommandContainer extends Map<string, CommandRoute> {
  /**
   * Set of all prefixes the bot has
   */
  private _prefixes: Set<string>;
  /**
   * Set of all base command names the
   * container has.
   */
  private _names: Set<string>;

  /**
   * A set of commands tokens without any prefix
   * which will require additional message content checking
   */
  public commandsWithoutPrefix = new Set<string>();

  constructor(private commandTokenFactory = new CommandTokenFactory()) {
    super();
  }

  public hasPrefix(prefix: string) {
    return this._prefixes.has(prefix);
  }

  public hasCommand(command: string) {
    return this._names.has(command);
  }

  public apply(route: CommandRoute) {
    const token = this.commandTokenFactory.create(route);

    if (this.has(token)) {
      return;
    }

    const { prefix, name, alias } = route;

    if (!this.hasPrefix(prefix) && prefix !== undefined) {
      this._prefixes.add(prefix);
    }

    [name, ...alias].forEach((name) => {
      if (!this.hasCommand(name)) {
        return this._names.add(name);
      }

      const existing = this.commands.find((e) => e.hasName(name));

      if (existing.prefix === prefix) {
        throw new DuplicateCommandImplementationException(
          existing,
          route,
          name
        );
      }
    });

    if (prefix === undefined) {
      this.commandsWithoutPrefix.add(token);
    }

    this.set(token, route);
  }

  public remove(route: CommandRoute) {
    const token = this.commandTokenFactory.create(route);
    const { name, alias } = route.config;

    if (this.has(token)) {
      this.delete(token);
    }

    [name, ...alias].forEach((e) => {
      if (this._names.has(e)) {
        this._names.delete(e);
      }
    });
  }

  public get prefixes() {
    return iterate(this._prefixes).toArray();
  }

  public get commands() {
    return iterate(this)
      .toArray()
      .map(([token, command]) => command);
  }

  public getCommandByName(name: string, prefix?: string) {
    return typeof prefix === "undefined"
      ? this.commands.find((config) => config.hasName(name))
      : this.commands.find(
          (config) => config.hasName(name) && config.prefix.includes(prefix)
        );
  }

  /**
   * True if the container only holds commands with a prefix
   */
  public get hasOnlyPrefixes() {
    return this.commandsWithoutPrefix.size === 0;
  }
}
