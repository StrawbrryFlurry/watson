import { BaseRoute, CommandConfiguration, ParameterConfiguration } from '.';

/**
 * Represents a command *route* which is mapped
 * to the event handler
 */
export interface CommandRoute extends BaseRoute {
  /**
   * The name of the command
   */
  name: string;
  /**
   * The parameters registered for this command
   */
  params: ParameterConfiguration[];
  /**
   * Alias for this command
   */
  alias: string[];
  /**
   * The command configuration set in the
   * `@core/command()` decorator
   */
  configuration: CommandConfiguration;
  /**
   * Wether the command is a sub command
   */
  isSubCommand: boolean;
  /**
   * The parent command route e.g.
   * the host command - `null` if
   * this is the parent command
   */
  parent: CommandRoute | null;
  /**
   * A map of sub commands for
   * this route. - `null` if there
   * are no sub commands.
   */
  children: Map<string, CommandRoute> | null;
  /**
   * Checks if this route supports a given
   * command name
   */
  hasName(name: string, exact?: boolean): boolean;
  /**
   * Returns the commands configuration object
   */
  getConfiguration(): CommandConfiguration;
}
