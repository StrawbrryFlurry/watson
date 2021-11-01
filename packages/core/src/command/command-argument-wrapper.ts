import { CommandArgument, CommandToken, CommandTokenKind } from '@watsonjs/common';

export class CommandArgumentWrapper<T = any> implements CommandArgument<T> {
  public name: string;
  public description: string;

  public value: T;
  public defaultValue?: any;

  public type: CommandTokenKind;
  public token: CommandToken;

  public hungry: boolean;
  public optional: boolean;

  constructor(options: CommandArgument) {
    Object.assign(this, options);
  }
}
