import { Observable } from 'rxjs';

export interface CommandArgumentType<T = any> {
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
  parse(token: string): T | Promise<T> | Observable<T>;
}
