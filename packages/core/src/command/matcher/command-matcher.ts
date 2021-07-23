import { ICommandPrefix, UnknownCommandException } from '@watsonjs/common';
import { Message } from 'discord.js';

import { CommandRoute } from '../../router';
import { resolveAsyncValue } from '../../util/resolve-async-value';
import { CommandContainer } from '../pipe';

export interface CommandMatchResult {
  command: string;
  prefix: ICommandPrefix;
  route: CommandRoute;
}

export class CommandMatcher {
  private container: CommandContainer;
  private prefixes: ICommandPrefix[];
  private commands: Map<string, string>;
  /**
   * Because this class will be insanciated
   * before all routes were mapped by
   * the routes explorer some prefixes or
   * commands might have not been mapped.
   * Therefore we need to initialize
   * the matcher when it's first used.
   */
  private initialized: boolean = false;

  /**
   * TODO:
   * Evaluate if message caching is worth the memory cost
   *
   * @key The guild id + the message content
   * @value The corresponding command
   */
  // private messageCache = new Map<string, CommandRouteHost>();

  /**
   *
   */
  constructor(container: CommandContainer) {
    this.container = container;
  }

  public async match(message: Message): Promise<CommandMatchResult> {
    if (this.initialized === false) {
      this.prefixes = this.container.getPrefixesAsArray();
      this.commands = this.container.getCommandsMap();
      this.initialized = true;
    }

    const { content } = message;
    const commandPrefix = await this.checkForPrefix(message);

    if (commandPrefix === undefined) {
      return;
    }

    const { isNamedPrefix, prefix } = commandPrefix;
    let command = content.substr(prefix.length);

    if (isNamedPrefix) {
      command = command.trim();
    }

    const routeRef = this.getCommand(command);

    return {
      route: routeRef,
      prefix: commandPrefix,
      command: command,
    };
  }

  private async checkForPrefix(message: Message) {
    const { content } = message;
    const trimmed = content.trim();

    for (const commandPrefix of this.prefixes) {
      const prefix = await resolveAsyncValue<string, string>(
        commandPrefix.getPrefix(message)
      );

      if (trimmed.startsWith(prefix)) {
        commandPrefix.prefix = prefix;
        return commandPrefix;
      }
    }
  }

  private getCommand(content: string) {
    const [command] = content.split(" ");

    if (this.commands.has(command)) {
      const id = this.commands.get(command);
      return this.container.get(id);
    }

    throw new UnknownCommandException(content);
  }
}
