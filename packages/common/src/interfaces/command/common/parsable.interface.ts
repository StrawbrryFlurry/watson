import { Observable } from 'rxjs';

import { Token } from '../parsing';

/**
 * All command arguments must implement this interface
 * in order to parse the token to its value.
 */
export interface Parsable<T = any> {
  /**
   * This method is used to parsed the `token`
   * extracted from the message content to the
   * desired type `T`.
   * ```
   * // Message content
   * !greet "Some message!"
   *
   * // token
   * "Some message!"
   * ```
   */
  parse(token: Token): T | Promise<T> | Observable<T>;

  /**
   * Returns the next token that would be parsed.
   * Use this method if the custom type requires
   * multiple text blocks or something else
   * separated by the tokenizer.
   *
   * If you decide you don't want to use the
   * next token, you can also unget it by using
   * the parser instance in the command argument.
   */
  getNextToken?(): Token;
}

/**
 * @Injectable()
 * export class BoopArgument implements IParsable {
 *  parse(token: IToken) {
 *    return token.text.toUpperCase();
 *  }
 * }
 */
