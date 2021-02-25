import { CommandTokenType } from '@watsonjs/common';
import iterate from 'iterare';

import { CommandTokenHost } from './command-token';

export class CommandTokenList {
  private readonly _tokens = new Set<CommandTokenHost>();

  public getTokensOfType(type: CommandTokenType) {
    return this.tokens.filter((e) => e.type === type);
  }

  public getTokenByIndex(idx: number) {
    return this.tokens[idx];
  }

  public addToken(lineIdx: number) {
    const token = new CommandTokenHost();
    token.startIndex = lineIdx;
    const tokenidx = this._tokens.size;
    token.tokenIndex = tokenidx;
    this._tokens.add(token);
  }

  public get tokens() {
    return iterate(this._tokens).toArray();
  }

  /**
   * Returns the lastest token or a new one of the token
   * list is empty or the current one is completed
   */
  public getCurrentToken(lineIdx: number): CommandTokenHost {
    if (this._tokens.size === 0) {
      this.addToken(lineIdx);
      return this.getCurrentToken(lineIdx);
    }

    const token = this.tokens[this.lastIndex];

    if (token.hasFinished) {
      this.addToken(lineIdx);

      return this.getCurrentToken(lineIdx);
    }

    return token;
  }

  private get lastIndex() {
    return this._tokens.size - 1;
  }

  public get length() {
    return this._tokens.size;
  }
}
