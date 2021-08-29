import { Prefix } from '@interfaces';

import { CommandConfiguration } from '.';
import { CommandParameterOptions } from '../..';
import { BaseRoute } from './base-route.interface';

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
  params: CommandParameterOptions[];
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
   * Checks if this route supports a given
   * command name
   */
  hasName(name: string): boolean;
}
