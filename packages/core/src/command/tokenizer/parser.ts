import { CommandContainer } from '@command';
import { CommandAst, CommandRoute, CommandTokenKind, isNil, Parser, Token } from '@watsonjs/common';
import { Message } from 'discord.js';

import { WatsonContainer } from '../..';
import { ParsingException } from '../exceptions';
import { AstPrefixImpl, CommandAstImpl } from './ast';
import { isGenericToken, isPrefixToken } from './parse-helper';
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
    const resolvedRouteRef = this.resolveSubCommand(routeRef, tokens);

    const { configuration } = routeRef;

    // Parsing arguments

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
    }

    return "" as any;
  }

  /**
   * Resolves a command route using
   * the parsed command tokens to find
   * the deepest nested command.
   */
  public resolveSubCommand(
    route: CommandRoute,
    tokens: Token<CommandTokenKind>[]
  ): CommandRoute {
    let routeRef = route;

    while (!isNil(routeRef.children)) {
      const { children } = routeRef;
      const nextToken = tokens.shift();

      if (!isGenericToken(nextToken)) {
        tokens.unshift(nextToken);
        break;
      }

      const { text } = nextToken;
      const childToken = children.get(text.toLowerCase());

      if (isNil(childToken)) {
        tokens.unshift(nextToken);

        break;
      }

      const childRef = this._commandContainer.get(childToken);
      const { caseSensitive } = childRef.configuration;

      if (caseSensitive) {
        const hasName = childRef.hasName(text, true);

        if (!hasName) {
          /**
           * TODO:
           * This might break bots where
           * there is a sub command which
           * requires a case sensitive name
           * but also an argument that is
           * the same string but in lower case:
           *
           * !help User - lists help for all user commands
           * !help user - Gets help for the user command
           * -----------------------------------------------
           * Should we just accept the last matched route
           * and interpret this token as an argument?
           */
          throw new Error(
            "Command was matched but does not have correct casing"
          );
        }
      }

      routeRef = childRef;
    }

    return routeRef;
  }

  private readonly tokenizer: CommandTokenizer;
}
