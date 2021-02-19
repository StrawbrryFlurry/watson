/**
 * Possible types of command arguments.
 * @enum {string}
 */
export enum CommandArgumentType {
  /** Text channel mentioned by a member using'#'
   * ```
   * #general
   * #welcome
   * #music
   * ```
   */
  CHANNEL = "arg:type:channel",
  /**
   * A member mentioned by a member using '@'
   * ```
   * !ban @Michael
   * !ban @User
   * ```
   */
  USER = "arg:type:user",
  /**
   * A role mentioned by a member using '@'
   * ```
   * !members @everyone
   * !members @admin
   * !members @moderator
   * ```
   */
  ROLE = "arg:type:role",
  /**
   * A named switch param repressents a boolean value
   * @example
   * !members -config
   * Will set config to true
   * if the swich is omitted the value is false
   */
  SWITCH = "arg:type:switch",
  /**
   * A single string value
   * @example
   * !say "command and stuff"
   */
  STRING = "arg:type:string",
  /**
   * A single number value
   * @example
   * !random 20
   */
  NUMBER = "arg:type:number",
  /**
   * A date string.
   * Watson will try to parse the value using dayjs.
   * If it cannot be parsed an error message will be sent to the user.
   * @example
   * !remind 16.10.2020-12:00
   */
  DATE = "arg:type:date",
  /**
   * A string value without markers
   * !help command
   */
  TEXT = "arg:type:text",
  /**
   * Represents a custom type that can be parsed by a pipe
   * or a parser specified within the command declaration.
   */
  CUSTOM = "arg:type:custom",
}
