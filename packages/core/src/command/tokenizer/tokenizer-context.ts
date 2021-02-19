import { TokenizingException } from '../exceptions';
import { CommandTokenType } from './command-token';
import { CommandTokenList } from './command-token-list';

export enum TokenizerContextType {
  NONE = "tokenizer:context:none",
  START = "tokenizer:context:start",
  PARAMETER = "tokenizer:type:parameter",
  ARGUMENT = "tokenizer:type:argument",
  BASE = "tokenizer:type:base",
  STRING_ARGUMENT = "tokenizer:type:string.argument",
  END = "tokenizer:context:end",
}

export enum TokenizerKnownCharacters {
  NAMED_PARAM_SINGLE = "-",
  BEGIN_STRING_SINGLE = `'`,
  BEGIN_STRING_DOUBLE = `"`,
}

export const TOKENIZER_SKIPPABLE_CHARS = / |\t|\f|\v|\n|\r|^.{0}$/;

export class TokenizerContext {
  private context: TokenizerContextType;
  private _content: string;
  private tokens: CommandTokenList;

  private char: string;
  private lineIndex: number;

  constructor(content: string) {
    this._content = content;
    this.tokens = new CommandTokenList();
    this.context = TokenizerContextType.START;
  }

  public tokenize() {
    const chars = this.toCharArray(this._content);
    let index = 0;

    for (let char of chars) {
      this.char = char;
      this.lineIndex = index;
      this.readChar();
      index++;
    }

    this.update(TokenizerContextType.END);

    return this.tokens;
  }

  private readChar() {
    if (this.context === TokenizerContextType.START) {
      return this.update(TokenizerContextType.BASE, CommandTokenType.BASE);
    }

    if (this.context === TokenizerContextType.NONE) {
      if (this.isStringChar()) {
        return this.update(
          TokenizerContextType.STRING_ARGUMENT,
          CommandTokenType.STRING_ARGUMENT
        );
      }

      if (this.isNamedParam()) {
        return this.update(
          TokenizerContextType.PARAMETER,
          CommandTokenType.PARAMETER
        );
      }

      if (!this.isSkippable()) {
        return this.update(
          TokenizerContextType.ARGUMENT,
          CommandTokenType.ARGUMENT
        );
      }

      return;
    }

    if (
      this.isSkippable() &&
      this.context !== TokenizerContextType.STRING_ARGUMENT
    ) {
      return this.update(TokenizerContextType.NONE);
    }

    if (this.context === TokenizerContextType.STRING_ARGUMENT) {
      if (this.isStringChar() && this.isValidStringTerminator()) {
        return this.update(TokenizerContextType.NONE);
      }
    }

    this.appendToToken();
  }

  private setContext(context: TokenizerContextType) {
    if (this.context === TokenizerContextType.END) {
      throw new TokenizingException(
        "Cannot change the context of a tokenizer that has already finished",
        this.tokens
      );
    }

    this.context = context;
  }

  private toCharArray(s: string) {
    if (typeof s === "undefined" || s.length === 0) {
      throw new TokenizingException(
        "Cannot tokenize a null string",
        this.tokens
      );
    }

    const charArray = s.split("");
    return charArray;
  }

  private isStringChar() {
    return (
      this.char === TokenizerKnownCharacters.BEGIN_STRING_SINGLE ||
      this.char === TokenizerKnownCharacters.BEGIN_STRING_DOUBLE
    );
  }

  private isNamedParam() {
    return this.char === TokenizerKnownCharacters.NAMED_PARAM_SINGLE;
  }

  private isSkippable() {
    return this.char.match(TOKENIZER_SKIPPABLE_CHARS) !== null;
  }

  private isValidStringTerminator() {
    return this.isStringChar() && this.char === this.token.getCharAtIndex(0);
  }

  private update(context: TokenizerContextType, tokenType?: CommandTokenType) {
    if (context === TokenizerContextType.NONE) {
      this.appendToToken();
      this.markAsComplete();

      return this.setContext(context);
    }

    if (context === TokenizerContextType.END) {
      if (this.context === TokenizerContextType.STRING_ARGUMENT) {
        throw new TokenizingException(
          `Invalid string terminator found for string starting at index: ${this.token.startIndex}`,
          this.tokens,
          this.token
        );
      }

      if (this.context !== TokenizerContextType.NONE) {
        this.markAsComplete();
      }

      return this.setContext(TokenizerContextType.END);
    }

    this.appendToToken();
    this.token.type = tokenType;
    return this.setContext(context);
  }

  private appendToToken() {
    if (
      this.context !== TokenizerContextType.STRING_ARGUMENT &&
      this.isSkippable()
    ) {
      return;
    }

    this.token.append(this.char);
  }

  private markAsComplete() {
    this.token.markAsCompleted(this.lineIndex);
  }

  private get token() {
    return this.tokens.getCurrentToken(this.lineIndex);
  }
}
