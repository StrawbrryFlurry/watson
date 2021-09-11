import { CommandParameterOptions } from "@decorators";
import { CommandParameterType } from "@interfaces";

export interface ParameterConfiguration
  extends Required<CommandParameterOptions> {
  /**
   * The number representation of the type
   * which can be used easier than types
   * for matching.
   */
  paramType: CommandParameterType;
}
