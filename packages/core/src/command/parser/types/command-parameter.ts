import { CommandBase } from './command-base';

/**
 * A command parameter is a named parameter.
 *
 * @example
 * ```
 * !help -command help
 * ```
 *
 * Where `-command` is the named parameter.
 */
export class CommandParameter {
  /**
   * The base command from whose content this parameter was tokenized
   */
  public base: CommandBase;
  /**
   * The route parameter to which this parameter was matched to
   */
  public routeParam: unknown;
  /**
   * The tokenized content from the message e.g `-command`
   */
  public content: string;
}
