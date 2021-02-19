import { CommandPrefix } from '@watsonjs/common/command/common/command-prefix';
import * as hash from 'object-hash';

import { CommandRoute } from '../routes';
import { genearateRandomString } from './random-string.helper';

interface ITokenData {
  id: string;
  names: string[];
  prefix: CommandPrefix;
}

export class CommandTokenFactory {
  private commandIdCache = new WeakMap<CommandRoute, string>();

  public create(command: CommandRoute) {
    const id = this.getCommandId(command);
    const { prefix, name, alias } = command;
    const token: ITokenData = {
      id: id,
      prefix: prefix,
      names: [name, ...alias],
    };

    return hash(token) as string;
  }

  public getCommandId(command: CommandRoute) {
    if (this.commandIdCache.has(command)) {
      return this.commandIdCache.get(command);
    }

    const id = genearateRandomString();
    this.commandIdCache.set(command, id);

    return id;
  }
}
