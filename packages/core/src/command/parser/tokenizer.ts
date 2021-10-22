import { EmoteTokenImpl } from '@core/command';
import {
  char,
  CommandAst,
  CommandTokenKind,
  isNil,
  Parser,
  StringBuilder,
  Token,
  Tokenizer,
  TokenPosition,
  UNICODE_EMOJI_REGEX,
} from '@watsonjs/common';

import {
  ChannelMentionTokenImpl,
  CodeBlockTokenImpl,
  GenericTokenImpl,
  IdentifierTokenImpl,
  NumberTokenImpl,
  ParameterTokenImpl,
  PrefixTokenImpl,
  RoleMentionTokenImpl,
  StringExpandableTokenImpl,
  StringLiteralTokenImpl,
  StringTemplateTokenImpl,
  TokenKindIdentifier,
  TokenPositionImpl,
  UserMentionTokenImpl,
} from './token';

export class CommandTokenizer implements Tokenizer<CommandTokenKind> {
  private _input: string;
  private _index: number = 0;
  private _tokenStart: number = 0;
  private _tokens: Token[] = [];
  private _parser: Parser<CommandAst>;
  /**
   * If set to true will stop the processing of the current
   * token and move on to the next one
   */
  private _forceSkipToken = false;

  private _stringBuilders: StringBuilder[] = [];

  constructor(parser: Parser<CommandAst>) {
    this._parser = parser;
  }

  get parser(): Parser<CommandAst> {
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
    parser?: Parser
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

  /** @Section Utilities */

  public getChar(): char | null {
    this._index += 1;

    // New index is out of bounds
    if (this.index === this.length) {
      return null;
    }

    return this._input[this._index];
  }

  public peekChar(): char | null {
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
    return this._tokens.pop()!;
  }

  /**
   * Resets the pointer position to the token start
   * You made an oopsie huh? :P
   */
  protected resync(index?: number) {
    this._index = index ?? this.tokenStart;
  }

  protected resyncToPosition(position: TokenPosition) {
    const { tokenStart } = position;
    this._index = tokenStart! - 1;
  }

  protected currentPosition(): TokenPosition {
    return new TokenPositionImpl(this._input, this._tokenStart, this._index);
  }

  protected canBeSkipped(char: char): boolean {
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
    return char === "'" || char === '"' || char === "`";
  }

  protected isNumber(char: char): boolean {
    return Number(char) !== NaN;
  }

  protected isIdentifier(char: char): boolean {
    switch (char) {
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
        return true;
      }
      default: {
        return false;
      }
    }
  }

  /**
   * Are the next two characters a backtick
   */
  protected isCodeBlockPattern(): boolean {
    const next1 = this.getChar();
    const next2 = this.peekChar();
    this.ungetChar();

    if (next1 === "`" && next2 === "`") {
      return true;
    }

    return false;
  }

  /** @Section Newable helpers */

  public saveToken<T extends Token<CommandTokenKind>>(token: T): T {
    this._tokens.push(token);
    return token;
  }

  protected newPrefixToken(sb: string) {
    return this.saveToken(new PrefixTokenImpl(sb, this.currentPosition()));
  }

  protected newNumberToken(sb: StringBuilder) {
    return this.saveToken(
      new NumberTokenImpl(sb.toString(), this.currentPosition())
    );
  }

  protected newGenericToken(sb: StringBuilder): GenericTokenImpl {
    return this.saveToken(
      new GenericTokenImpl(sb.toString(), this.currentPosition())
    );
  }

  protected newStringExpandableToken(
    sb: StringBuilder
  ): StringExpandableTokenImpl {
    return this.saveToken(
      new StringExpandableTokenImpl(sb.toString(), this.currentPosition())
    );
  }

  protected newStringLiteralToken(sb: StringBuilder): StringLiteralTokenImpl {
    return this.saveToken(
      new StringLiteralTokenImpl(sb.toString(), this.currentPosition())
    );
  }

  protected newStringTemplateToken(sb: StringBuilder): StringTemplateTokenImpl {
    return this.saveToken(
      new StringTemplateTokenImpl(sb.toString(), this.currentPosition())
    );
  }

  protected newUserMentionToken(
    text: StringBuilder,
    id: StringBuilder
  ): UserMentionTokenImpl {
    return this.saveToken(
      new UserMentionTokenImpl(
        text.toString(),
        id.toString(),
        this.currentPosition()
      )
    );
  }

  protected newRoleMentionToken(
    text: StringBuilder,
    id: StringBuilder
  ): RoleMentionTokenImpl {
    return this.saveToken(
      new RoleMentionTokenImpl(
        text.toString(),
        id.toString(),
        this.currentPosition()
      )
    );
  }

  protected newChannelMentionToken(
    text: StringBuilder,
    id: StringBuilder
  ): ChannelMentionTokenImpl {
    return this.saveToken(
      new ChannelMentionTokenImpl(
        text.toString(),
        id.toString(),
        this.currentPosition()
      )
    );
  }

  protected newEmoteToken(
    text: StringBuilder,
    id: StringBuilder | null
  ): EmoteTokenImpl {
    return this.saveToken(
      new EmoteTokenImpl(
        text.toString(),
        id?.toString() ?? null,
        this.currentPosition()
      )
    );
  }

  protected newIdentifierToken(
    value: StringBuilder,
    text: StringBuilder
  ): IdentifierTokenImpl {
    return new IdentifierTokenImpl(
      value.toString(),
      text.toString(),
      this.currentPosition()
    );
  }

  protected newParameterToken(
    value: StringBuilder,
    doubleDashed: boolean = false
  ): IdentifierTokenImpl {
    return new ParameterTokenImpl(
      value.toString(),
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
      new CodeBlockTokenImpl(
        text.toString(),
        value.toString(),
        language.toString(),
        this.currentPosition()
      )
    );
  }

  /** @Section Scanners */

  protected scanPrefixToken(length: number): string {
    const prefix = this._input.substr(0, length);
    this.skipChar(length);
    return prefix;
  }

  /**
   * @param identifier The character that marked this token
   * as an identifier
   *
   * !!Not yet used!!
   */
  protected scanIdentifier(identifier: char) {
    const value = new StringBuilder();

    if (identifier === "-") {
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

  protected scanParameter() {
    const sb = new StringBuilder();
    const next = this.getChar();
    let doubleDashed = false;

    if (next === "-") {
      doubleDashed = true;
    } else {
      this.ungetChar();
    }

    while (!this.atEom()) {
      const c = this.getChar()!;

      switch (c) {
        case TokenKindIdentifier.WhiteSpace:
        case TokenKindIdentifier.HorizontalTab:
        case TokenKindIdentifier.VerticalTab:
        case TokenKindIdentifier.LineFeed:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.FormattedPageBreak: {
          return this.newParameterToken(sb, doubleDashed);
        }
        default: {
          if (this.isIdentifier(c)) {
            sb.append(c);
            continue;
          }

          return this.newGenericToken(sb);
        }
      }
    }

    return this.newGenericToken(sb);
  }

  /**
   * Do the next characters represent a
   * discord token?
   *
   * The first leading '<' was already consumed.
   * If the following token is a discord
   * token, return true and save that token.
   */
  protected scanDiscordToken(char: char): Token | null {
    const idx = this.index;
    const text = new StringBuilder(char);
    const id = new StringBuilder();
    let semicolonCount = 0;
    let kind: CommandTokenKind | null = null;

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
          text.append(c);

          if (kind !== CommandTokenKind.Emote || semicolonCount === 2) {
            id.append(c);
          }

          continue;
        }
        case "#":
        case "@": {
          if (kind === CommandTokenKind.Emote) {
            text.append(c);
            continue;
          }

          // Must be the second character
          if (text.length > 1) {
            this.resync(idx);
            return null;
          }
          kind =
            c === "@"
              ? CommandTokenKind.UserMention
              : CommandTokenKind.ChannelMention;
          text.append(c);
          continue;
        }
        case "&": {
          if (kind === CommandTokenKind.Emote) {
            text.append(c);
            continue;
          }

          if (text.length !== 2 || !text.has("@")) {
            this.resync(idx);
            return null;
          }

          kind = CommandTokenKind.RoleMention;
          text.append(c);
          continue;
        }
        case ":": {
          if (semicolonCount > 1) {
            this.resync(idx);
            return null;
          }

          semicolonCount++;
          kind = CommandTokenKind.Emote;
          text.append(c);
          continue;
        }
        case ">": {
          if (isNil(kind)) {
            this.resync(idx);
            return null;
          }

          if (kind === CommandTokenKind.Emote && semicolonCount !== 2) {
            text.append(c);
            continue;
          }

          text.append(c);

          switch (kind) {
            case CommandTokenKind.UserMention:
              return this.newUserMentionToken(text, id);
            case CommandTokenKind.RoleMention:
              return this.newRoleMentionToken(text, id);
            case CommandTokenKind.ChannelMention:
              return this.newChannelMentionToken(text, id);
            case CommandTokenKind.Emote:
              return this.newEmoteToken(text, id);
            default: {
              this.resync(idx);
              return null;
            }
          }
        }
        default: {
          if (isNil(c)) {
            this.resync(idx);
            return null;
          }

          /**
           * Emote tokens can probably have all kinds of
           * crazy characters in them so we don't want
           * to look for all of them.
           */
          if (kind === CommandTokenKind.Emote) {
            /**
             * Checking if token looks like:
             * "<:xxx"
             */
            if (semicolonCount !== 2) {
              text.append(c);
            }
          }

          this.resync(idx);
          return null;
        }
      }
    }

    this.resync(idx);
    return null;
  }

  /**
   * The initial `<` was already consumed once
   * this method is called.
   */
  protected scanDiscordIdentifier(char: char) {
    const discordToken = this.scanDiscordToken(char);

    if (isNil(discordToken)) {
      return this.scanGenericToken(char);
    }

    return discordToken;
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
      const c = this.getChar()!;

      if (c === identifier) {
        return true;
      }

      sb.append(c);
    }

    this.resync();
    return false;
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringExpandable() {
    const sb = new StringBuilder();
    const isValidString = this.scanStringIdentifier('"', sb);

    if (isValidString) {
      return this.newStringLiteralToken(sb);
    }

    this.resync();
    return this.scanGenericToken(this.getChar()!);
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringLiteral() {
    const sb = new StringBuilder();
    const isValidString = this.scanStringIdentifier("'", sb);

    if (isValidString) {
      return this.newStringLiteralToken(sb);
    }

    this.resync();
    return this.scanGenericToken(this.getChar()!);
  }

  /**
   * When this method is called the
   * string identifier was already removed
   */
  protected scanStringTemplate() {
    const sb = new StringBuilder();
    const isValidString = this.scanStringIdentifier("`", sb);

    if (isValidString) {
      return this.newStringLiteralToken(sb);
    }

    this.resync();
    return this.scanGenericToken(this.getChar()!);
  }

  protected scanNumber(char: char, isNegative?: boolean) {
    const sb = new StringBuilder(char);
    const idx = this._index;

    if (isNegative) {
      sb.insert("-");
    }

    while (!this.atEom()) {
      const c = this.getChar()!;
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
          if (this.isWhiteSpace(c) || this.isNewLine(c)) {
            return this.newNumberToken(sb);
          }

          /* The token did not start with a `-`
           * Which marks a parameter
           */
          if (isNegative !== true) {
            return this.scanGenericToken(sb);
          }

          if (this.isIdentifier(c)) {
            this.resync(idx);
            return this.scanParameter();
          }
        }
      }
    }

    return this.newNumberToken(sb);
  }

  /**
   * The first "`" was already removed
   */
  protected scanCodeBlock() {
    const code = new StringBuilder();
    const language = new StringBuilder();
    const text = new StringBuilder("`");

    if (!this.isCodeBlockPattern()) {
      return this.scanGenericToken(text);
    }

    /**
     * Grab the next two backticks
     * that define the code block
     */
    text.append(this.getChar()!);
    text.append(this.getChar()!);

    let isScanningLanguage = true;

    while (!this.atEom()) {
      const c = this.getChar()!;

      switch (c) {
        case "`": {
          // Marks the end of the code block
          if (!this.isCodeBlockPattern()) {
            code.append(c);
            text.append(c);
            continue;
          }

          text.append(this.getChar()!);
          text.append(this.getChar()!);

          return this.newCodeBlockToken(text, code, language);
        }
        case TokenKindIdentifier.FormattedPageBreak:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.WhiteSpace:
        case TokenKindIdentifier.LineFeed: {
          if (isScanningLanguage) {
            isScanningLanguage = false;
            text.append(c);
            continue;
          }

          text.append(c);
          code.append(c);
          continue;
        }
        default: {
          if (isScanningLanguage) {
            text.append(c);
            language.append(c);
            continue;
          }

          text.append(c);
          code.append(c);
        }
      }
    }

    return this.scanGenericToken(text);
  }

  protected scanGenericToken(sb: StringBuilder): GenericTokenImpl;
  protected scanGenericToken(char: char): GenericTokenImpl;
  protected scanGenericToken(input: char | StringBuilder): GenericTokenImpl {
    const sb = new StringBuilder(input);

    while (!this.forceNewToken && !this.atEom()) {
      const c = this.getChar()!;

      switch (c) {
        case TokenKindIdentifier.WhiteSpace:
        case TokenKindIdentifier.CharacterReturn:
        case TokenKindIdentifier.FormattedPageBreak:
        case TokenKindIdentifier.LineFeed:
        case TokenKindIdentifier.VerticalTab:
        case TokenKindIdentifier.HorizontalTab: {
          return this.newGenericToken(sb);
        }
        case "<": {
          const idx = this.index;
          if (!isNil(this.scanDiscordToken(c))) {
            this.resync(idx - 1);
            this.newGenericToken(sb);
          }
        }
        case "`": {
          if (this.isCodeBlockPattern()) {
            this.ungetChar();
            return this.newGenericToken(sb);
          }
        }
        default: {
          sb.append(c);
        }
      }
    }

    return this.newGenericToken(sb);
  }

  public nextToken(): Token<CommandTokenKind> {
    this._tokenStart = this._index;
    const c = this.getChar()!;

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
      case "'":
        return this.scanStringLiteral();
      case '"':
        return this.scanStringExpandable();
      case "`": {
        if (this.isCodeBlockPattern()) {
          return this.scanCodeBlock();
        }

        return this.scanStringTemplate();
      }
      case "<": {
        return this.scanDiscordIdentifier(c);
      }
      case "-": {
        const next = this.peekChar()!;

        // Is probably part of some text
        // The parser will try to piece the
        // actual text back together
        if (this.isWhiteSpace(next)) {
          return this.newGenericToken(new StringBuilder(c));
        }

        if (this.isNumber(next)) {
          const next = this.getChar()!;
          return this.scanNumber(next, true);
        }

        if (next === "-") {
          this.scanParameter();
        }
      }
      default:
        if (UNICODE_EMOJI_REGEX.test(c)) {
          return this.newEmoteToken(new StringBuilder(c), null);
        }

        return this.scanGenericToken(c);
    }
  }
}
