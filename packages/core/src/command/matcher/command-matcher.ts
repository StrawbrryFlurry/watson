import { CommandPrefix, UnknownCommandException } from '@watsonjs/common';
import { Message } from 'discord.js';

import { resolveAsyncValue } from '../../helpers/resolve-async-value';
import { CommandRouteHost } from '../../router';
import { CommandContainer } from '../pipe';

export interface CommandMatchResult {
  command: string;
  prefix: CommandPrefix;
  route: CommandRouteHost;
}

export class CommandMatcher {
  private container: CommandContainer;
  private prefixes: CommandPrefix[];
  private commands: Map<string, string>;

  /**
   * TODO:
   * Evaluate if message caching is worth the memory cost
   *
   * @key The guild id + the message content
   * @value The coresponding command
   */
  // private messageCache = new Map<string, CommandRouteHost>();

  /**
   *
   */
  constructor(container: CommandContainer) {
    this.container = container;
    this.prefixes = this.container.getPrefixesAsArray();
    this.commands = this.container.getCommandsMap();
  }

  public async match(message: Message): Promise<CommandMatchResult> {
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
      return this.container.get(command);
    }

    throw new UnknownCommandException(content);
  }
}
