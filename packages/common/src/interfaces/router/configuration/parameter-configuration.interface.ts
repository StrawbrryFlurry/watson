import { CommandParameterOptions } from '@common/decorators';
import { CommandParameterType } from '@common/interfaces';

export interface ParameterConfiguration
  extends Required<CommandParameterOptions> {
  /**
   * The number representation of the type
   * which can be used easier than types
   * for matching.
   */
  paramType: CommandParameterType;
}
