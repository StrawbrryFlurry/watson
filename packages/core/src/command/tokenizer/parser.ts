import { CommandAst, Parser, Token } from '@watsonjs/common';
import { Message } from 'discord.js';

import { ParsingException } from '../exceptions';
import { AstPrefixImpl, CommandAstImpl } from './ast';
import { isPrefixToken } from './parse-helper';
import { CommandTokenizer } from './tokenizer';

export class CommandParser implements Parser<CommandAst> {
  parseInput(tokenList: Token<any>[]): CommandAst {
    throw new Error("Method not implemented.");
  }

  parseMessage(message: Message, prefixLength: number): CommandAst {
    const tokenizer = new CommandTokenizer(this);
    const ast = new CommandAstImpl();
    const { content } = message;
    const tokens = tokenizer.tokenize(content, prefixLength);

    const prefix = tokens.shift();

    if (!isPrefixToken(prefix)) {
      throw new ParsingException("No valid prefix found");
    }

    ast.prefix = new AstPrefixImpl(prefix);

    // Trying to find the command
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens.shift();
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
    }

    return "" as any;
  }

  private readonly tokenizer: CommandTokenizer;
}
