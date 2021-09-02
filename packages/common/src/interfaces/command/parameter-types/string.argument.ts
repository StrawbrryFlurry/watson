/**
 * Double quoted string literal - `"`
 * Expandable strings could reference variables
 * in future releases
 * @example
 * !say "Hewwo!"
 */
export abstract class AStringExpandable extends String {}
/**
 * Single quoted string literal - `'`
 *
 * @example
 * !say 'Hewwo!'
 */
export abstract class AStringLiteral extends String {}
/**
 * A string string literal quoted with a single back tick - '`'
 * @example
 * !say `Hewwo!`
 */
export abstract class AStringTemplate extends String {}
