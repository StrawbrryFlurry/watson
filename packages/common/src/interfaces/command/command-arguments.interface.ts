import { Message } from 'discord.js';

import { CommandArgument } from './command-argument.interface';
import { CommandPrefix } from './command-prefix.interface';
import { CommandToken } from './tokenization';

export interface CommandArguments {
  /**
   * The base command name
   */
  base: string;
  /**
   * The command prefix used
   */
  prefix: CommandPrefix;
  /**
   * The arguments that were parsed from
   * the message content as well as the ones promted
   * from the user
   */
  arguments: CommandArgument[];
  /**
   * The parsed tokens from the message content
   */
  tokens: CommandToken[];
  /**
   * Are all arguments for the arguments
   * for this host resolved.
   */
  isResolved: boolean;
  /**
   * The message in which this command
   * was used
   */
  message: Message;
  /**
   * Get the argument coresponding to the name of the parameter
   */
  getArgumentByParam(param: string): CommandArgument;
}
