import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { W_PARAM_TYPE } from '@common/fields';

/**
 * A valid URL e.g. link.
 * @example
 * https://youtube.com
 */
export abstract class AUrl extends URL {
  static [W_PARAM_TYPE] = CommandParameterType.URL;
}
