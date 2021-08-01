import { CommandTokenKind, ICommandAst, IParser, IToken } from '@watsonjs/common';
import { Message } from 'discord.js';

import { ParsingException } from '../exceptions';
import { AstPrefix, CommandAst } from './ast';
import { isPrefixToken, isTokenKind } from './parse-helper';
import { GenericToken } from './token';
import { CommandTokenizer } from './tokenizer';

export class CommandParser implements IParser<ICommandAst> {
  parseInput(tokenList: IToken<any>[]): ICommandAst {
    throw new Error("Method not implemented.");
  }

  parseMessage(message: Message, prefixLength: number): ICommandAst {
    const tokenizer = new CommandTokenizer(this);
    const ast = new CommandAst();
    const { content } = message;
    const tokens = tokenizer.tokenize(content, prefixLength);

    const prefix = tokens.shift();

    if (!isPrefixToken(prefix)) {
      throw new ParsingException("No valid prefix found");
    }

    ast.prefix = new AstPrefix(prefix);

    for (const token of tokens) {
      if (isTokenKind<GenericToken>(token, CommandTokenKind.Generic)) {
        token.kind;
      }
    }

    return "" as any;
  }

  private readonly tokenizer: CommandTokenizer;
}
