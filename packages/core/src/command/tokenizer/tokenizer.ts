import { char, CommandTokenKind, IParser, isNil, IToken, ITokenizer, ITokenPosition, StringBuilder } from '@watsonjs/common';

import {
  ChannelMentionToken,
  CodeBlockToken,
  GenericToken,
  IdentifierToken,
  NumberToken,
  ParameterToken,
  PrefixToken,
  RoleMentionToken,
  StringExpandableToken,
  StringLiteralToken,
  StringTemplateToken,
  Token,
  TokenKindIdentifier,
  TokenPosition,
  UserMentionToken,
} from './token';

/**
 * TODO:
 * Local StringBuilder queue to avoid
 * creating new instances for every token - less gc
 */
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
  /**
   * An array of tokens that were pre parsed
   * already while determining a token.
   *
   * While getting a next token this
   * array is checked and the most recent
   * value is popped of if there is one.
   */
  private _tokenCache: IToken[] = [];

  private _stringBuilders: StringBuilder[] = [];

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
    prefixLength: number,
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

    this.newPrefixToken(this.scanPrefixToken(prefixLength));

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

  public skipChar(skipBy: number = 1): void {
    this._index += skipBy;
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

  protected initStringBuilders() {
    this._stringBuilders = [
      new StringBuilder(),
      new StringBuilder(),
      new StringBuilder(),
    ];
  }

  protected getStringBuilder(value: string | StringBuilder) {
    return (
      this._stringBuilders.pop().append(value as string) ||
      new StringBuilder(value)
    );
  }

  protected releaseStringBuilder(sb: StringBuilder): string {
    const string = sb.toString();
    sb.clear();
    return string;
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
   * Do the next characters represent a
   * discord token?
   *
   * The first leading '<' was already consumed.
   */
  protected isDiscordToken(): boolean {
    const idx = this.index;
    const sb = new StringBuilder("<");
    let kind: CommandTokenKind;

    while (!this.atEom()) {
      const c = this.getChar();
      switch (c) {
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
          /**
           * No check for @ or # needed here
           * as it's already checked in a later
           * step if the rest of the token is valid
           */
          sb.append(c);
          continue;
        }
        case TokenKindIdentifier.NumberSign:
        case TokenKindIdentifier.AtSign: {
          if (sb.has(c) || sb.length > 0) {
            this.resync(idx);
            return false;
          }
          kind =
            c === TokenKindIdentifier.AtSign
              ? CommandTokenKind.UserMention
              : CommandTokenKind.ChannelMention;
          sb.append(c);
          continue;
        }
        case TokenKindIdentifier.AmpersandSign: {
          if (
            sb.has(c) ||
            sb.length > 1 ||
            !sb.has(TokenKindIdentifier.AtSign)
          ) {
            this.resync(idx);
            return false;
          }
          kind = CommandTokenKind.RoleMention;
          sb.append(c);
          continue;
        }
        case TokenKindIdentifier.GreaterThan: {
          if (
            sb.has(TokenKindIdentifier.AtSign) ||
            sb.has(TokenKindIdentifier.NumberSign)
          ) {
            this.resync(idx);
            return false;
          }
          let token: Token;
          sb.append(c);

          switch (kind) {
            case CommandTokenKind.UserMention:
              token = this.newUserMentionToken(sb);
              break;
            case CommandTokenKind.RoleMention:
              token = this.newRoleMentionToken(sb);
              break;
            case CommandTokenKind.ChannelMention:
              token = this.newChannelMentionToken(sb);
              break;
          }

          this.cacheToken(token);
          return true;
        }
        default: {
          this.resync(idx);
          return false;
        }
      }
    }

    return false;
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

  protected reportError(error: string, position: ITokenPosition) {
    // TODO: Implement optional error handling
  }

  // Newable helpers

  protected cacheToken<T extends Token<CommandTokenKind>>(token: T): T {
    this._tokenCache.unshift(token);
    return token;
  }

  public saveToken<T extends Token<CommandTokenKind>>(token: T): T {
    this._tokens.push(token);
    return token;
  }

  protected newPrefixToken(sb: string) {
    return this.saveToken(new PrefixToken(sb, this.currentPosition()));
  }

  protected newNumberToken(sb: StringBuilder) {
    return this.saveToken(
      new NumberToken(sb.toString(), this.currentPosition())
    );
  }

  protected newGenericToken(sb: StringBuilder): GenericToken {
    return this.saveToken(
      new GenericToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringExpandableToken(sb: StringBuilder): StringExpandableToken {
    return this.saveToken(
      new StringExpandableToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringLiteralToken(sb: StringBuilder): StringLiteralToken {
    return this.saveToken(
      new StringLiteralToken(sb.toString(), this.currentPosition())
    );
  }

  protected newStringTemplateToken(sb: StringBuilder): StringTemplateToken {
    return this.saveToken(
      new StringTemplateToken(sb.toString(), this.currentPosition())
    );
  }

  protected newUserMentionToken(sb: StringBuilder): UserMentionToken {
    return this.saveToken(
      new UserMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newRoleMentionToken(sb: StringBuilder): RoleMentionToken {
    return this.saveToken(
      new RoleMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newChannelMentionToken(sb: StringBuilder): ChannelMentionToken {
    return this.saveToken(
      new ChannelMentionToken(sb.toString(), this.currentPosition())
    );
  }

  protected newIdentifierToken(
    value: StringBuilder,
    text: StringBuilder
  ): IdentifierToken {
    return new IdentifierToken(
      value.toString(),
      text.toString(),
      this.currentPosition()
    );
  }

  protected newParameterToken(
    value: StringBuilder,
    text: StringBuilder,
    doubleDashed: boolean = false
  ): IdentifierToken {
    return new ParameterToken(
      value.toString(),
      text.toString(),
      doubleDashed,
      this.currentPosition()
    );
  }

  protected newCodeBlockToken(
    text: StringBuilder,
    value: StringBuilder,
    language: StringBuilder
  ) {
    return this.saveToken(
      new CodeBlockToken(
        text.toString(),
        value.toString(),
        language.toString(),
        this.currentPosition()
      )
    );
  }

  // Scanners

  protected scanPrefixToken(length: number): string {
    const prefix = this._input.substr(0, length);
    this.skipChar(length);
    return prefix;
  }

  protected scanDash() {
    const isDashDash = this.peekChar() === TokenKindIdentifier.Dash;
    if (isDashDash) {
      this.skipChar();
    }
  }

  /**
   * @param identifier The character that marked this token
   * as an identifier
   */
  protected scanIdentifier(identifier: char) {
    const value = new StringBuilder();

    if (identifier === TokenKindIdentifier.Dash) {
      const next = this.peekChar();

      if (identifier) {
      }
    }

    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar();

      switch (c) {
        case TokenKindIdentifier.WhiteSpace:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.FormattedPageBreak:
        case TokenKindIdentifier.LineFeed:
        case TokenKindIdentifier.VerticalTab:
        case TokenKindIdentifier.HorizontalTab: {
          const text = new StringBuilder(value);
          text.insert(identifier);
        }
      }
    }
  }

  protected scanDiscordIdentifier(char: char) {
    let type: CommandTokenKind;
    let scanning = true;

    while (scanning && !this.atEom()) {
      const c = this.getChar();
      switch (c) {
        // Is channel mention
        case TokenKindIdentifier.NumberSign: {
        }
        // Is user or channel mention
        case TokenKindIdentifier.AtSign: {
          if (!isNil(type)) {
            this.resync();
            return this.scanGenericToken(char);
          }
        }
      }
    }

    return this.saveToken(
      new Token(CommandTokenKind.ChannelMention, "", this.currentPosition())
    );
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

      switch (c) {
        // Is valid identifier
        case "a":
        case "b":
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
        case "h":
        case "i":
        case "j":
        case "k":
        case "l":
        case "m":
        case "n":
        case "o":
        case "p":
        case "q":
        case "r":
        case "s":
        case "t":
        case "u":
        case "v":
        case "w":
        case "x":
        case "y":
        case "z":
        case "A":
        case "B":
        case "C":
        case "D":
        case "E":
        case "F":
        case "G":
        case "H":
        case "I":
        case "J":
        case "K":
        case "L":
        case "M":
        case "N":
        case "O":
        case "P":
        case "Q":
        case "R":
        case "S":
        case "T":
        case "U":
        case "V":
        case "W":
        case "X":
        case "Y":
        case "Z":
        case "_": {
        }
      }

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

  protected scanNumber(char: char, isNegative?: boolean) {
    const sb = new StringBuilder(char);

    if (isNegative) {
      sb.insert("-");
    }

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

      switch (c) {
        case TokenKindIdentifier.WhiteSpace:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.FormattedPageBreak:
        case TokenKindIdentifier.LineFeed:
        case TokenKindIdentifier.VerticalTab:
        case TokenKindIdentifier.HorizontalTab: {
          return this.newGenericToken(sb);
        }
        case TokenKindIdentifier.LessThan: {
          const isDiscordToken = this.isDiscordToken();
          this.ungetChar();
          return this.newGenericToken(sb);
        }
        default: {
          sb.append(c);
        }
      }
    }

    return this.newGenericToken(sb);
  }

  public nextToken(): Token<CommandTokenKind> {
    if (this._tokenCache.length > 0) {
      const token = this._tokenCache[0];
      this.resync(token.position.tokenEnd + 1);
      return this._tokenCache[0];
    }

    this._tokenStart = this._index;
    const c = this.getChar();

    switch (c) {
      /**
       *  In the future it might make sense to save these
       * tokens to more accurately rebuild generic tokens
       * to a string
       */
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
      case TokenKindIdentifier.LessThan: {
        return this.scanDiscordIdentifier(c);
      }
      case TokenKindIdentifier.Dash: {
        const next = this.peekChar();

        // Is probably part of some text
        // The parser will try to piece the
        // Actual text back together
        if (this.isWhiteSpace(next)) {
          return this.newGenericToken(new StringBuilder(c));
        }

        if (this.isNumber(next)) {
          const next = this.getChar();
          return this.scanNumber(next);
        }

        if (next === TokenKindIdentifier.Dash) {
          this.scanDash();
        }
      }
      default:
        return this.scanGenericToken(c);
    }
  }
}
