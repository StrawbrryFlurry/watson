import { char } from './char.interface';
import { IParser } from './parser.interface';
import { IToken } from './token.interface';

/**
 * The tokenizer is responsible to parse
 * text into more manageable pieces, CommandTokens,
 * which can then be used by the parser to assign
 * bits of the message to different arguments defined
 * for a route as well as pre fetch information from
 * the discord client like user information in mentions.
 */
export interface ITokenizer<T> {
  /**
   * The current cursor position of the
   * tokenizer.
   *
   * --------------------------------
   * ```
   * Boop
   * ^ (0)
   * ```
   */
  get index(): number;
  /**
   * Before each iteration the starting
   * index of the next token is stored in
   * this property. On error we can step
   * back to this position and figure out
   * what went wrong.
   */
  get tokenStart(): number;
  /**
   * All tokens processed by the tokenizer
   */
  get tokens(): IToken<T>[];
  /** Instance of the token parser */
  get parser(): IParser<T>;
  /**
   * Returns a token list from the input
   * string.
   */
  tokenize(input: string): IToken<T>[];
  /**
   * Returns the next character
   * in the input string and moves
   * the cursor to the next position.
   * --------------------------------
   * ```
   * Boop
   *  ^ (1) idx + 1
   * ```
   */
  getChar(): char | null;
  /**
   * Returns the next character
   * in the input string without
   * moving the cursor.
   * --------------------------------
   * ```
   * Boop
   *  ^ (1) idx + 0
   * ```
   */
  peekChar(): char | null;
  /**
   * Skips the next character
   * by moving the cursor by one
   * --------------------------------
   * ```
   * Boop
   *  ^ (1) idx + 1
   * ```
   */
  skipChar(): void;
  /**
   * Returns the current character
   * and moves the cursor back by one position
   * --------------------------------
   * ```
   * Boop
   * ^ (0) idx - 1
   * ```
   */
  ungetChar(): char;
  /**
   * Returns the next token in the input.
   */
  nextToken(): IToken<T>;
  /**
   * Is the index at the end of the message
   */
  atEom(): boolean;
  /**
   * Saves a token to the tokenizer
   */
  saveToken<Token extends IToken<T>>(token: Token): void;
  /** ScanTokenKind */
  /* Implement scanning method for a given token kind which handles that specific kind */
}
