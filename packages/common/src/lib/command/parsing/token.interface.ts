export interface Token<T = any> {
  /** Is null if the token was made for a default value */
  text: string | null;
  /** Is null if the token was made for a default value */
  kind: T | null;
  position: TokenPosition;
}

/**
 * The position of the token substring
 * in the input.
 */
export interface TokenPosition {
  /**
   * The zero based starting index
   *
   * `null` if the token was made
   * for a default value
   */
  tokenStart: number | null;
  /**
   * The exclusive end index
   * 
   * `null` if the token was made
   * for a default value
   
   */
  tokenEnd: number | null;
  /**
   * The Text this token came from.
   *
   * `null` if the token was made
   * for a default value
   */
  text: string | null;
}
