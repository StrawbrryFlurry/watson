import { PermissionResolvable } from 'discord.js';

import { COMMAND_METADATA } from '../../constants';
import { Prefix } from '../../interfaces';
import { isNil, isObject, isString } from '../../utils/shared.utils';

export interface CommandOptions {
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
   * The permissions required by the client to run this command
   * @default none
   */
  clientPermissions?: PermissionResolvable[];
  /**
   * Sets the prefix for the command.
   * If no prefix was set the receiver prefix is used.
   * If no prefix was set in the receiver the global prefix will be used.
   * @example
   * !ban @username
   * Where `!` is the prefix
   */
  prefix?: string | Prefix;
  /**
   * Requires the format of the command message to exactly match the command name
   * @example
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
 * Marks a method in an receiver as a usable bot command
 * @param command The name of the command
 * @param commandOptions Options to configure the command
 *
 * The default command name is the descriptor name of the method
 * To define parameters for the command you can specify parameters for the
 * decorated method which Watson will add to the command configuration. The type
 * can either be a custom parsed class that implements the CommandArgumentType interface
 * or a builtin type.
 *
 * The parsed argument will automaticuall be injected to the parameter
 * that has registered it.
 * ```ts
 *  import { User } from 'discord.js';
 *  import { UserArgument } from '@watsonjs/common';
 *
 * `@Command("ping")`
 *  public ping(user: UserArgument) {  }
 * ```
 * You might want to have a more fine grade control over your
 * parameters. For that you can use the `@Param` decorator.
 *
 * ```ts
 *  import { User } from 'discord.js';
 *  import { UserArgument } from '@watsonjs/common';
 *
 * `@Command("ping")`
 *  public ping(`@Param`({ label: "The target user who is being pinged" }) user: UserArgument) {  }
 * ```
 */
export function Command(): MethodDecorator;
export function Command(command: string): MethodDecorator;
export function Command(commandOptions: CommandOptions): MethodDecorator;
export function Command(
  command: string,
  commandOptions: CommandOptions
): MethodDecorator;
export function Command(
  command?: string | CommandOptions,
  commandOptions?: CommandOptions
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | Symbol,
    descriptor: PropertyDescriptor
  ) => {
    let options: CommandOptions = {};

    if (!isNil(commandOptions)) {
      options["command"] = command as string;
      options = commandOptions;
    } else if (isString(command)) {
      options["command"] = command;
    } else if (isObject(command)) {
      options = command;
    }

    Reflect.defineMetadata(COMMAND_METADATA, options, descriptor.value);
  };
}
