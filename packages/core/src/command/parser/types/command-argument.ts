import { CommandArgumentType } from '@watsonjs/common';

import { CommandBase } from './command-base';
import { CommandParameter } from './command-parameter';

/**
 * Command arguments are tokenized by the `CommandTokenizer` and
 * represent an argument to either a named parameter or the command itself.
 *
 * @example
 * ```
 * !help help
 * ```
 *
 * Where `help` is the argument
 */
export class CommandArgument {
  /**
   * The base command from whose content this argument was tokenized
   */
  public base: CommandBase;
  /**
   * The tokenized content from the message e.g `help`
   */
  public content: string;
  /**
   * The route parameter to which this argument was matched to
   */
  public routeParam: unknown;
  /**
   * The named parameter this argument was given for
   *
   * @example
   * ```
   * !help -command help
   * ```
   * Would end up being the CommandParameter class instance for `-command`
   */
  public parameter?: CommandParameter;
  /**
   * The type this argument should be parsed as
   */
  public type: CommandArgumentType;
}
