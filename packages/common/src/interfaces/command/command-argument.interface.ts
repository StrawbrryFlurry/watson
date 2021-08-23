import { CommandToken, CommandTokenKind } from '.';

export interface CommandArgument<T = any> {
  value: T;
  type: CommandTokenKind;
  token: CommandToken;
}
