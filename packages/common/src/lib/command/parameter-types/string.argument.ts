import { CommandParameterType } from '@common/command/parameter-types/parameter-type.enum';
import { ParameterType } from '@common/decorators/common/parameter-type.decorator';

/**
 * Double quoted string literal - `"`
 * Expandable strings could reference variables
 * in future releases
 * @example
 * !say "Hewwo!"
 */
@ParameterType(CommandParameterType.StringExpandable)
export abstract class AStringExpandable extends String {}
/**
 * Single quoted string literal - `'`
 *
 * @example
 * !say 'Hewwo!'
 */
@ParameterType(CommandParameterType.StringLiteral)
export abstract class AStringLiteral extends String {}
/**
 * A string string literal quoted with a single back tick - '`'
 * @example
 * !say `Hewwo!`
 */
@ParameterType(CommandParameterType.StringTemplate)
export abstract class AStringTemplate extends String {}
