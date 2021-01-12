import { MessageEmbed, Snowflake } from 'discord.js';

import { COMMAND_METADATA } from '../../constants';
import { CommandArgumentType, ResponseChannelType } from '../../enums';
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
   * Promt the user for an action
   * @interface ICommandPromt
   */
  promt?: ICommandPromt;
  /**
   * If the type a date this parameter is required to parse the date.
   */
  dateFormat?: string;
}

export interface ICommandReaction {
  /**
   * The emote expected
   * If the value if Falsy watson will listen to all reactions until the timeout runs out.
   * The param will then consits of an array containing all reactions
   */
  emote: Snowflake | string | boolean;
  /**
   * Listen for commands by all users not only the author
   * @default false
   */
  multiUser?: boolean;
}

export interface ICommandPromt {
  /**
   * The promt text send to the user
   */
  text: (ctx: unknown) => string | MessageEmbed;
  /**
   * The message sent to the user if the type doesn't match the param type
   */
  retryText: (ctx: unknown) => string | MessageEmbed;
  /**
   * Expects the user to react to the message.
   */
  reaction?: ICommandReaction;
  /**
   * Retry attpemts the user will be given
   * @default 4
   */
  tries?: number;
  /**
   * Time in ms the bot is waiting for the user to respond
   * @default 4000
   */
  timeout?: number;
}

export interface IResponseChannelOptions {
  /**
   * The response channel type
   */
  type: ResponseChannelType;
  /**
   * The name of the channel in the guilde
   */
  name?: string;
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
   * A regular expression used to parse the command arguments
   */
  paramRegex?: RegExp;
  /**
   * Parameters of the command
   * @interface ICommandParam
   */
  params?: ICommandParam[];
  /**
   * Sets the command to only be available in direct messages
   * @default false
   */
  directMessage?: boolean;
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
  /**
   * Change the channel in which the bot will send the response message
   *
   * @default ResponseChannelType.SAME The same channel the message was sent to.
   */
  responseChannel?: IResponseChannelOptions;
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
