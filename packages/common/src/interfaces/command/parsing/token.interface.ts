export interface Token<T = any> {
  text: string;
  kind: T;
  position: TokenPosition;
}

/**
 * The position of the token substring
 * in the input.
 */
export interface TokenPosition {
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
