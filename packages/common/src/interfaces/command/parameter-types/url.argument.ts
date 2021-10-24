import { CommandParameterType } from '@common/interfaces/command/parameter-types';
import { W_PARAM_TYPE } from 'packages/common/src';

/**
 * A valid URL e.g. link.
 * @example
 * https://youtube.com
 */
export abstract class AUrl extends URL {
  static [W_PARAM_TYPE] = CommandParameterType.URL;
}
