/**
 * Possible types of command arguments.
 * @enum {string}
 */
export enum CommandArgumentTypes {
  /** Text channel mentioned by a member using'#'
   * ```
   * #general
   * #welcome
   * #music
   * ```
   */
  CHANNEL = "arg_type_channel",
  /**
   * A member mentioned by a member using '@'
   * ```
   * !ban @Michael
   * !ban @User
   * ```
   */
  USER = "arg_type_user",
  /**
   * A role mentioned by a member using '@'
   * ```
   * !members @everyone
   * !members @admin
   * !members @moderator
   * ```
   */
  ROLE = "arg_type_role",
  /**
   * A single string value
   * @example
   * !
   */
  STRING = "arg_type_string",
  /**
   * A multi string value
   * @example
   * !message `Lorem ipsum dolor`
   */
  SENTENCE = "arg_type_sentence",
  /**
   * A single number value
   * @example
   * !random 20
   */
  NUMBER = "arg_type_number",
  /**
   * A date string.
   * Watson will try to parse the value using dayjs.
   * If it cannot be parsed an error message will be sent to the user.
   * @example
   * !remind 16.10.2020-12:00
   */
  DATE = "arg_type_date",
}
