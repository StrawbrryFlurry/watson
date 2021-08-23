import * as hash from 'object-hash';

import { CommandRoute } from '../../router';
import { CommandPrefixHost } from '../../router/command/command-prefix-host';
import { generateId } from '../../util/random-string.helper';

interface TokenData {
  id: string;
  names: string[];
  prefix: CommandPrefixHost;
}

export class CommandTokenFactory {
  private commandIdCache = new WeakMap<CommandRoute, string>();

  public create(command: CommandRoute) {
    const id = this.getCommandId(command);
    const { prefix, name, alias } = command;
    const token: TokenData = {
      id: id,
      prefix: prefix as any,
      names: [name, ...alias],
    };

    return hash(token) as string;
  }

  public getCommandId(command: CommandRoute) {
    if (this.commandIdCache.has(command)) {
      return this.commandIdCache.get(command);
    }

    const id = generateId();
    this.commandIdCache.set(command, id);

    return id;
  }
}
