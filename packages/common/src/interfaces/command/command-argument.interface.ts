import { CommandToken, Token } from '.';

export interface CommandArgument<T = any, K extends Token = CommandToken> {
  name: string;
  description: string;

  value: T;
  defaultValue?: T;

  /** The command token kind of the argument */
  type: K["kind"];
  token: K;

  /**
   * If the argument is hungry,
   * it will "eat" all the following
   * tokens for the rest of the message.
   */
  hungry: boolean;
  optional: boolean;
}
