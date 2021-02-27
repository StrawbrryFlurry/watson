import * as hash from 'object-hash';

import { CommandRouteHost } from '../router';
import { CommandPrefixHost } from '../router/command/command-prefix-host';
import { genearateRandomString } from './random-string.helper';

interface ITokenData {
  id: string;
  names: string[];
  prefix: CommandPrefixHost;
}

export class CommandTokenFactory {
  private commandIdCache = new WeakMap<CommandRouteHost, string>();

  public create(command: CommandRouteHost) {
    const id = this.getCommandId(command);
    const { prefix, name, alias } = command;
    const token: ITokenData = {
      id: id,
      prefix: prefix as any,
      names: [name, ...alias],
    };

    return hash(token) as string;
  }

  public getCommandId(command: CommandRouteHost) {
    if (this.commandIdCache.has(command)) {
      return this.commandIdCache.get(command);
    }

    const id = genearateRandomString();
    this.commandIdCache.set(command, id);

    return id;
  }
}
