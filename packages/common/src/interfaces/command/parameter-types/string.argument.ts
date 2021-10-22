import { CommandParameterType } from '@common/interfaces';

import { W_PARAM_TYPE } from '../../../';

/**
 * Double quoted string literal - `"`
 * Expandable strings could reference variables
 * in future releases
 * @example
 * !say "Hewwo!"
 */
export abstract class AStringExpandable extends String {
  static [W_PARAM_TYPE] = CommandParameterType.StringExpandable;
}
/**
 * Single quoted string literal - `'`
 *
 * @example
 * !say 'Hewwo!'
 */
export abstract class AStringLiteral extends String {
  static [W_PARAM_TYPE] = CommandParameterType.StringLiteral;
}
/**
 * A string string literal quoted with a single back tick - '`'
 * @example
 * !say `Hewwo!`
 */
export abstract class AStringTemplate extends String {
  static [W_PARAM_TYPE] = CommandParameterType.StringTemplate;
}
