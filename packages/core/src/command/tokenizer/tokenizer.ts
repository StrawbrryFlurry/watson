import { CommandTokenKind, IParser, ITokenizer } from '@watsonjs/common';

import { Token } from './token';

//TODO: Command Parsing
// Determine if the message could possibly be a command
// Tokenize the message
// Parse the message and make sure it is a valid command
// Parse AST
// Call Command Route

/** */
export class CommandTokenizer implements ITokenizer<CommandTokenKind> {
  private _input: string;
  private _index: number = 0; 
  private _tokenStart: number = 0;
  private _tokens: Token[] = [];
  private _parser: IParser<CommandTokenKind>;

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

  public tokenize(input: string): Token<CommandTokenKind>[] {
    /* Reset internal state */
    this._input =input;
    this._index = 0;
    this._tokenStart = 0;
    this._tokens = [];

    while(!this.atEom()) {
      this.saveToken(this.nextToken());
    }

    return this._tokens
  }

  protected newWhiteSpaceToken() {}

  public getChar(): string {
    throw new Error("Method not implemented.");
  }

  public peekChar(): string {
    throw new Error("Method not implemented.");
  }

  public skipChar(): void {
    throw new Error("Method not implemented.");
  }

  public ungetChar(): string {
    throw new Error("Method not implemented.");
  }

  public atEom(): boolean {
    return this._index === this.length
  }

  public saveToken<T extends Token<CommandTokenKind>>(token: T) {
    switch (token.kind) {
      case CommandTokenKind.WhiteSpace:
        break;
    }
  }

  public nextToken(): Token<CommandTokenKind> {
    throw new Error("Method not implemented.");
  }
}
