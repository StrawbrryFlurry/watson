import { PermissionResolvable } from 'discord.js';

import { CommandPrefix } from '../../command/common/command-prefix';
import { COMMAND_METADATA } from '../../constants';
import { CommandArgumentType } from '../../enums';
import { isNil, isObject, isString } from '../../utils/shared.utils';

export interface ICommandParam {
  /**
   * Internal name the parameter should be reffered as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name: string;
  /**
   * Lable that describes the parameter
   */
  label?: string;
  /**
   * Internal type the parameter should be parsed as
   * @default CommandArgumentType.TEXT
   */
  type?: CommandArgumentType;
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
   * The default value if none was provided
   */
  default?: any;
  /**
   * If the type a date this parameter is required to parse the date.
   */
  dateFormat?: string;
  /**
   * The promt that will be used to ask for this parameter
   * if it was not specified
   */
  promt?: string;
  /**
   * An array of options the user can choose from
   * for this argument.
   */
  choices?: string[];
}

export interface ICommandCooldown {
  /**
   * The timeout in seconds
   * @default 5
   */
  timeout?: number;
  /**
   * Is the cooldown user specific for
   * a user or anyone in a guild
   * @default true
   */
  user?: boolean;
}

export interface ICommandOptions {
  /**
   * Name of the command
   * @default The descriptor name will be used.
   */
  name?: string;
  /**
   * Aliases under which the command is available
   * @default none
   */
  alias?: string[];
  /**
   * Description of the command.
   * @default none
   */
  description?: string;
  /**
   * Tags of the command
   * @example
   * NSFW, Fun
   * @default none
   */
  tags?: string[];
  /**
   * Makes the channel available in guilds.
   * @default true
   */
  guild?: boolean;
  /**
   * Makes the channel available in dms
   * @default false
   */
  dm?: boolean;
  /**
   * The permissions required by the client to run this command
   * @default none
   */
  clientPermissions?: PermissionResolvable[];
  /**
   * Adds a cooldown for this command
   * @see ICommandCooldown
   * @default none
   */
  cooldown?: ICommandCooldown;
  /**
   * Promt for arguments if one was not provided
   * @default false
   */
  promt?: boolean;
  /**
   * The maximum number of argument promts per agument
   * @default 1
   */
  maxPromts?: number;
  /**
   * Seconds to wait for a user to provide the
   * argument promted for
   * @default 10
   */
  promtTimeout?: number;
  /**
   * Parameters of the command
   * @see ICommandParam
   * @default none
   */
  params?: ICommandParam[];
  /**
   * Sets the prefix for the command.
   * If no prefix was set the receiver prefix is used.
   * If no prefix was set in the receiver the global prefix will be used.
   */
  prefix?: string | CommandPrefix;
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
  /**
   * Hides the command from the builtin
   * help command.
   * @default false
   */
  hidden?: boolean;
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
export function Command(
  command: string,
  commandOptions: ICommandOptions
): MethodDecorator;
export function Command(
  command?: string | ICommandOptions,
  commandOptions?: ICommandOptions
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    let options: ICommandOptions = {};

    if (!isNil(commandOptions)) {
      options["command"] = command as string;
    } else if (isString(command)) {
      options["command"] = command;
    } else if (isObject(command)) {
      options = command;
    }

    Reflect.defineMetadata(COMMAND_METADATA, options, descriptor.value);
  };
}
