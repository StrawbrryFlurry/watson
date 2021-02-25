import { CommandPrefix, UnknownCommandException } from '@watsonjs/common';
import { Message } from 'discord.js';

import { resolveAsyncValue } from '../../helpers/resolve-async-value';
import { CommandRouteHost } from '../../routes';
import { CommandContainer } from '../pipe';

export class CommandMatcher {
  private container: CommandContainer;
  private prefixes: CommandPrefix[];
  private commands: Map<string, string>;

  constructor(container: CommandContainer) {
    this.container = container;
    this.prefixes = this.container.getPrefixesAsArray();
    this.commands = this.container.getCommandsMap();
  }

  public async matches(message: Message): Promise<CommandRouteHost> {
    const { content } = message;
    const commandPrefix = await this.checkForPrefix(message);

    if (commandPrefix === undefined) {
      return;
    }

    const { isNamedPrefix, prefix } = commandPrefix;
    let contentWithoutPrefix = content.substr(prefix.length);

    if (isNamedPrefix) {
      contentWithoutPrefix = contentWithoutPrefix.trim();
    }

    return this.getCommand(contentWithoutPrefix);
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
