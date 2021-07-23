export interface IToken<T = any> {
  text: string;
  kind: T;
  position: ITokenPosition;
}

/**
 * The position of the token substring
 * in the input.
 */
export interface ITokenPosition {
  /**
   * The zero based starting index
   */
  tokenStart: number;
  /**
   * The exclusive end index
   */
  tokenEnd: number;
  /**
   * The Text this token came from.
   */
  text: string;
}
