import { Prefix } from '@interfaces';

import { CommandConfiguration } from '.';
import { BaseRoute } from './base-route.interface';
import { ParameterConfiguration } from './configuration/parameter-configuration.interface';

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
   * The prefix declaration for this command
   * that implements the `CommandPrefix` interface
   */
  commandPrefix: Prefix;
  /**
   * Alias for this command
   */
  alias: string[];
  /**
   * The command configuration set in the
   * `@Command()` decorator
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
  children: Map<string, string> | null;
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
