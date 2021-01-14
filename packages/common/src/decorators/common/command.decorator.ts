import { COMMAND_METADATA } from '../../constants';
import { CommandArgumentType } from '../../enums';
import { isObject, isString } from '../../utils/shared.utils';

export interface ICommandParam {
  /**
   * Internal name the parameter should be reffered as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name: string;
  /**
   * Internal type the parameter should be parsed as
   */
  type: CommandArgumentType;
  /**
   * Makes the parameter optional.
   * Optional parameters cannot be followed by mandatory ones.
   * If default is set this option will automatically be set
   * @default false
   */
  optional?: boolean;
  /**
   * Uses the rest of the message content
   * This option can only be used for the last parameter
   * @default false
   */
  hungry?: boolean;
  /**
   * If the hungry options was not set and the command should listen for a sentence you'll need to specify an encapsulator for the sentence
   * @example
   * !set description "I like dogs! :3"
   * @default '"'
   */
  encapsulator?: string;
  /**
   * The default value if none was given
   */
  default?: any;
  /**
   * If the type a date this parameter is required to parse the date.
   */
  dateFormat?: string;
}
export interface ICommandOptions {
  /**
   * Name of the command
   * @default The descriptor name will be used.
   */
  command?: string;
  /**
   * Aliases under which the command is available
   */
  alias?: string[];
  /**
   * The delimiter used to parse arguments
   * @default \s e.g. " "
   */
  pramDelimiter?: string;
  /**
   * Parameters of the command
   * @interface ICommandParam
   */
  params?: ICommandParam[];
  /**
   * Sets the prefix for the command.
   * If no prefix was set the receiver prefix is used.
   * If no prefix was set in the receiver the global prefix will be used.
   */
  prefix?: string;
  /**
   * Requires the format of the command message to exactly match the command name
   * ```
   * `@command('help')`
   * // By default `!Help` will still work. If the option is set, it will require the command to be all lowercase.
   *```
   * @default false
   *
   */
  caseSensitive?: boolean;
}

/**
 * Marks a method in an receiver as a command
 * @param command The name of the command
 * @param commandOptions Options the command is configured with
 *
 * @default command The default command name is the descriptor name of the method
 */
export function Command(): MethodDecorator;
export function Command(command: string): MethodDecorator;
export function Command(commandOptions: ICommandOptions): MethodDecorator;
export function Command(command?: string | ICommandOptions): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    let options: ICommandOptions = {};

    if (isString(command)) {
      options["command"] = command;
    } else if (isObject(command)) {
      options = command;
    }

    Reflect.defineMetadata(COMMAND_METADATA, options, descriptor.value);
  };
}
