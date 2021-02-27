import { ICommandParam } from '../../decorators';
import { CommandPrefix } from '../command';
import { BaseRoute } from './base-route.interface';
import { CommandConfiguration } from './configuration';

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
  params: ICommandParam[];
  /**
   * The prefix used for this command
   */
  prefix: string;
  /**
   * The prefix declaration for this command
   * that implements the `CommandPrefix` interface
   */
  commandPrefix: CommandPrefix;
  /**
   * Alias for this command
   */
  alias: string[];
  /**
   * Returns the command configuration set in the
   * `@Command()` decorator
   */
  getConfiguration(): CommandConfiguration;
  /**
   * Checks if this route supports a given
   * command name
   */
  hasName(name: string): boolean;
}
