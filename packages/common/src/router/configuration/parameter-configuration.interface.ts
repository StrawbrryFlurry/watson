import { CommandParameterType } from '@common/command/parameter-types';
import { CommandParameterOptions } from '@common/decorators/common/param.decorator';

export interface ParameterConfiguration
  extends Required<CommandParameterOptions> {
  /**
   * The number representation of the type
   * which can be used easier than types
   * for matching.
   */
  paramType: CommandParameterType;
}
