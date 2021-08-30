import { CommandContainer } from '@command';
import { CommandAst, CommandTokenKind, Parser, Token } from '@watsonjs/common';
import { Message } from 'discord.js';

import { WatsonContainer } from '../..';
import { ParsingException } from '../exceptions';
import { AstPrefixImpl, CommandAstImpl } from './ast';
import { isPrefixToken } from './parse-helper';
import { CommandTokenizer } from './tokenizer';

export class CommandParser implements Parser<CommandAst> {
  private _commands: Map<string, string>;

  constructor(
    private _diContainer: WatsonContainer,
    private _commandContainer: CommandContainer
  ) {
    this._commands = this._commandContainer.commands;
  }

  public parseInput(tokenList: Token<any>[]): CommandAst {
    throw new Error("Method not implemented.");
  }

  public parseMessage(message: Message, prefixLength: number): CommandAst {
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
    const token = tokens.shift();
    const { text, kind } = token;

    if (kind !== CommandTokenKind.Generic) {
      throw new Error("No command specified");
    }

    const commandId = this._commands.get(text.toLowerCase());

    if (!commandId) {
      throw new Error("No matching command found");
    }

    const routeRef = this._commandContainer.get(commandId);
    const { configuration } = routeRef;

    // Parsing arguments

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
    }

    return "" as any;
  }

  private readonly tokenizer: CommandTokenizer;
}
