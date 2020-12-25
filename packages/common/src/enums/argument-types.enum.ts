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
   * A single string value
   * @example
   * !
   */
  STRING = "arg:type:string",
  /**
   * A multi string value
   * @example
   * !message `Lorem ipsum dolor`
   */
  SENTENCE = "arg:type:sentence",
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
}
