export interface CommandParameter<T = any> {
  /**
   * Internal name the parameter should be referred as.
   * It can then also be used to get the pram data using the @\param() decorator
   */
  name: string;
  /**
   * Label that describes the parameter
   */
  label?: string;
  /**
   * Makes the parameter optional.
   * Optional parameters cannot be followed by mandatory ones.
   * If default is set this option will automatically be set
   * @default false
   */
  optional: boolean;
  /**
   * Uses the rest of the message content
   * This option can only be used for the last parameter
   * @default false
   */
  hungry: boolean;
  /**
   * Type the parameter resolves to
   */
  type: T;
  /**
   * The default value if none was provided
   */
  default?: T;
  /**
   * An array of options the user can choose from
   * for this argument.
   */
  choices?: T[];
  /**
   * The index of the handler function
   * to which the parameter will be injected
   * to.
   *
   * ```ts
   * `@Command("ping")`
   * handlePing(@Param() param1: UserArgument) { ... }
   * // param1 => 0
   * ```
   */
  dependencyIndex: number;
}
