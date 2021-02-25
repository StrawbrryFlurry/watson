import { CommandPrefix, isNil } from '@watsonjs/common';

export class CommandPrefixHost implements CommandPrefix {
  public prefix: string;
  public isNamedPrefix: boolean;

  constructor(prefix: string, isNamed?: boolean) {
    this.prefix = prefix;
    this.isNamedPrefix = isNil(isNamed) ? false : isNamed;
  }

  public getPrefix() {
    return this.prefix;
  }
}
