import { char, CommandTokenKind, IParser, isNil, ITokenizer, ITokenPosition, StringBuilder } from '@watsonjs/common';

import {
  ChannelMentionToken,
  CodeBlockToken,
  GenericToken,
  NumberToken,
  RoleMentionToken,
  StringExpandableToken,
  StringLiteralToken,
  StringTemplateToken,
  Token,
  TokenKindIdentifier,
  TokenPosition,
  UserMentionToken,
} from './token';

export class CommandTokenizer implements ITokenizer<CommandTokenKind> {
  private _input: string;
  private _index: number = 0;
  private _tokenStart: number = 0;
  private _tokens: Token[] = [];
  private _parser: IParser<CommandTokenKind>;
  /**
   * If set to true will stop the processing of the current
   * token and move on to the next one
   */
  private _forceSkipToken = false;

  constructor(parser: IParser<CommandTokenKind>) {
    this._parser = parser;
  }

  get parser(): IParser<CommandTokenKind> {
    return this._parser;
  }

  public get index(): number {
    return this._index;
  }

  public get tokenStart(): number {
    return this._tokenStart;
  }

  public get tokens(): Token<CommandTokenKind>[] {
    return this._tokens;
  }

  protected get length() {
    return this._input.length;
  }

  protected get forceNewToken(): boolean {
    /**
     * Once this value was accessed by a condition
     * we can assume that the condition check moves
     * on to the next token. This keeps us from
     * resetting the value in every check.
     */
    if (this._forceSkipToken) {
      this._forceSkipToken = false;
      return true;
    }

    return false;
  }
  protected set forceNewToken(value: boolean) {
    this._forceSkipToken = value;
  }

  public tokenize(
    input: string,
    parser?: IParser<CommandTokenKind>
  ): Token<CommandTokenKind>[] {
    /* Reset internal state */
    this._input = input;
    this._index = 0;
    this._tokenStart = 0;
    this._tokens = [];
    this._forceSkipToken = false;
    this._parser = parser ?? this._parser;

    if (isNil(input)) {
      return [];
    }

    while (!this.atEom()) {
      this.nextToken();
    }

    return this._tokens;
  }

  // utils

  public getChar(): char {
    this._index += 1;

    // New index is out of bounds
    if (this.index === this.length) {
      return null;
    }

    return this._input[this._index];
  }

  public peekChar(): char {
    // New index is out of bounds
    if (this.index + 1 === this.length) {
      return null;
    }

    return this._input[this._index + 1];
  }

  public skipChar(): void {
    this._index += 1;
  }

  public ungetChar(): char {
    const ungetChar = this._input[this._index];
    this._index -= 1;
    return ungetChar;
  }

  public atEom(): boolean {
    return this._index === this.length;
  }

  /** Pushes a token to to token list */
  protected push(token: Token): void {
    this._tokens.push(token);
  }

  /**
   * Pops the last token off the token list
   */
  protected pop(): Token {
    return this._tokens.pop();
  }

  /**
   * Resets the pointer position to the token start
   * You made an oopsie huh? :P
   */
  protected resync(index?: number) {
    this._index = index ?? this.tokenStart;
  }

  protected currentPosition(): ITokenPosition {
    return new TokenPosition(this._input, this._tokenStart, this._index);
  }

  protected isSkippable(char: char): boolean {
    return this.isWhiteSpace(char) || this.isNewLine(char);
  }

  protected isWhiteSpace(char: char): boolean {
    return (
      char === TokenKindIdentifier.WhiteSpace ||
      char === TokenKindIdentifier.HorizontalTab ||
      char === TokenKindIdentifier.VerticalTab
    );
  }

  protected isNewLine(char: char): boolean {
    return (
      char === TokenKindIdentifier.LineFeed ||
      char === TokenKindIdentifier.CharacterReturn ||
      char === TokenKindIdentifier.FormattedPageBreak
    );
  }

  protected isStringIdentifier(char: char): boolean {
    return (
      char === TokenKindIdentifier.SingleQuote ||
      char === TokenKindIdentifier.DoubleQuote ||
      char === TokenKindIdentifier.BackTick
    );
  }

  protected isNumber(char: char): boolean {
    return Number(char) !== NaN;
  }

  /**
   * Are the next two characters a backtick
   */
  protected isCodeBlockPattern(): boolean {
    const next1 = this.getChar();
    const next2 = this.peekChar();
    this.ungetChar();

    if (
      next1 === TokenKindIdentifier.BackTick &&
      next2 === TokenKindIdentifier.BackTick
    ) {
      return true;
    }

    return false;
  }

  // Newable helpers

  public saveToken<T extends Token<CommandTokenKind>>(token: T): T {
    switch (token.kind) {
      case CommandTokenKind.WhiteSpace:
      case CommandTokenKind.NewLine:
        break;
      /** We don't need these tokens */
      case CommandTokenKind.UserMention:
      case CommandTokenKind.RoleMention:
      case CommandTokenKind.ChannelMention: {
        this.push(token);
        break;
      }
    }

    return token;
  }

  protected newNumberToken(sb: StringBuilder) {
    return this.saveToken(
      new NumberToken(sb.toString(), this.currentPosition())
    );
  }

  protected newDashToken() {}

  protected newDashDashToken() {}

  protected newGenericToken(sb: StringBuilder) {
    return this.saveToken(
      new GenericToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringExpandableToken(sb: StringBuilder) {
    return this.saveToken(
      new StringExpandableToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringLiteralToken(sb: StringBuilder) {
    return this.saveToken(
      new StringLiteralToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringTemplateToken(sb: StringBuilder) {
    return this.saveToken(
      new StringTemplateToken(sb.toString(), this.currentPosition())
    );
  }

  protected newUserMentionToken(sb: StringBuilder) {
    return this.saveToken(
      new UserMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newRoleMentionToken(sb: StringBuilder) {
    return this.saveToken(
      new RoleMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newChannelMentionToken(sb: StringBuilder) {
    return this.saveToken(
      new ChannelMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newCodeBlockToken(
    text: StringBuilder,
    sb: StringBuilder,
    language: StringBuilder
  ) {
    return this.saveToken(
      new CodeBlockToken(
        text.toString(),
        sb.toString(),
        language.toString(),
        this.currentPosition()
      )
    );
  }

  // Scanners

  protected scanDash() {
    const isDashDash = this.peekChar() === TokenKindIdentifier.Dash;
    if (isDashDash) {
      this.skipChar();
    }
  }

  /**
   * Checks the input for a valid string with the
   * closing identifier provided. If the string is
   * valid, e.g. the identifier is found again, true
   * is returned and the StringBuilder contains the
   * appended value of the string. If no string could
   * be formed with the input the cursor is reset to
   * the point where the identifier was found.
   */
  protected scanStringIdentifier(
    identifier: char,
    sb: StringBuilder = new StringBuilder(),
    resyncTo?: number
  ): boolean {
    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar();

      if (c === identifier) {
        return true;
      }

      sb.append(c);
    }

    this.resync(resyncTo);
    return false;
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringLiteral() {
    const sb = new StringBuilder();
    const isValidString = this.scanStringIdentifier(
      TokenKindIdentifier.SingleQuote,
      sb
    );

    if (isValidString) {
      return this.newStringLiteralToken(sb);
    }

    this.resync();
    return this.scanGenericToken(this.getChar());
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringTemplate() {
    const sb = new StringBuilder();
    return this.newStringExpandableToken(sb);
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringExpandable() {
    const sb = new StringBuilder();
    return this.newStringExpandableToken(sb);
  }

  protected scanNumber(char: char) {
    const sb = new StringBuilder(char);

    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar();
      switch (c) {
        case ".":
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          if (c === "." && sb.has(".")) {
            return this.scanGenericToken(sb);
          }

          sb.append(c);
          break;
        }
        default: {
          this.forceNewToken = true;
        }
      }
    }

    return this.newNumberToken(sb);
  }

  protected scanCodeBlock() {
    const sb = new StringBuilder();
    const language = new StringBuilder();
    const text = new StringBuilder("`");

    let isScanningIdentifier = true;
    let isScanningLanguage = false;
    const backTicks = ["`"];

    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar();

      switch (c) {
        case TokenKindIdentifier.BackTick: {
          if (backTicks.length <= 3) {
            backTicks.push(c);
            text.append(c);
            continue;
          }

          if (backTicks.length === 3) {
            if (!isScanningIdentifier) {
              backTicks.push(c);
              text.append(c);
              isScanningIdentifier = true;
              continue;
            }

            isScanningIdentifier = false;
            isScanningLanguage = true;
            continue;
          }

          const isCodeBlock = this.isCodeBlockPattern();

          if (backTicks.length > 3) {
            backTicks.push(c);
          }

          if (isCodeBlock) {
            backTicks.push(c);
          }

          text.append(c);

          if (backTicks.length === 6) {
            this.forceNewToken = true;
            continue;
          }
        }
        case TokenKindIdentifier.FormattedPageBreak:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.LineFeed: {
          if (isScanningLanguage) {
            isScanningLanguage = false;
            text.append(c);
            continue;
          }

          text.append(c);
          sb.append(c);
          continue;
        }
        default: {
          if (isScanningLanguage) {
            text.append(c);
            language.append(c);
            continue;
          }

          text.append(c);
          sb.append(c);
        }
      }
    }

    if (backTicks.length < 6) {
      return this.scanGenericToken(text);
    }

    return this.newCodeBlockToken(text, sb, language);
  }

  protected scanGenericToken(sb: StringBuilder): GenericToken;
  protected scanGenericToken(char: char): GenericToken;
  protected scanGenericToken(input: char | StringBuilder): GenericToken {
    const sb = new StringBuilder(input);

    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar();
      const idx = this._index;

      if (this.isStringIdentifier(c)) {
        const isValidString = this.scanStringIdentifier(
          c,
          new StringBuilder(),
          idx
        );

        if (!isValidString) {
          sb.append(c);
          continue;
        }

        // Reset to before this token
        // and scan for a new token
        this.resync(idx - 1);
        return this.newGenericToken(sb);
      }

      if (this.isNumber(c)) {
        this.resync(idx - 1);
        return this.newGenericToken(sb);
      }
    }

    return this.newGenericToken(sb);
  }

  public nextToken(): Token<CommandTokenKind> {
    this._tokenStart = this._index;
    const c = this.getChar();

    switch (c) {
      /** We ignore all whitespace / blank tokens */
      case TokenKindIdentifier.WhiteSpace:
      case TokenKindIdentifier.VerticalTab:
      case TokenKindIdentifier.HorizontalTab:
      case TokenKindIdentifier.FormattedPageBreak:
      case TokenKindIdentifier.CharacterReturn:
      case TokenKindIdentifier.LineFeed: {
        this.skipChar();
        return this.nextToken();
      }
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        return this.scanNumber(c);
      }
      case TokenKindIdentifier.SingleQuote:
        return this.scanStringLiteral();
      case TokenKindIdentifier.DoubleQuote:
        return this.scanStringExpandable();
      case TokenKindIdentifier.BackTick: {
        if (this.isCodeBlockPattern()) {
          return this.scanCodeBlock();
        }

        return this.scanStringTemplate();
      }
      case TokenKindIdentifier.Dash: {
      }
      default:
        return this.scanGenericToken(c);
    }
  }
}
