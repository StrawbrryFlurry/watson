import { AstArgumentImpl, AstCommandImpl, CommandContainer, isParameterToken } from '@command';
import {
  ADate,
  ArgumentsOf,
  AstArgument,
  AstCommand,
  CommandAst,
  CommandRoute,
  CommandTokenKind,
  DateParameterOptions,
  isEmpty,
  isNil,
  OmitFirstElement,
  ParsedAstArguments,
  Parser,
  Token,
  TokenPosition,
} from '@watsonjs/common';
import { Message } from 'discord.js';
import { DateTime, DateTimeOptions } from 'luxon';
import {
  ParameterConfiguration,
} from 'packages/common/src/interfaces/router/configuration/parameter-configuration.interface';

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

  public async parseInput(tokenList: Token<any>[]): Promise<CommandAst> {
    throw new Error("Method not implemented.");
  }

  public async parseMessage(
    message: Message,
    prefixLength: number
  ): Promise<CommandAst> {
    const tokenizer = new CommandTokenizer(this);
    const ast = new CommandAstImpl();
    const { content } = message;
    const tokens = tokenizer.tokenize(content, prefixLength);

    const prefixToken = tokens.shift();

    if (!isPrefixToken(prefixToken)) {
      throw new ParsingException("No valid prefixToken found");
    }

    const astPrefix = new AstPrefixImpl(prefixToken);

    const commandToken = tokens.shift();
    const { text: commandText, kind } = commandToken;

    if (kind !== CommandTokenKind.Generic) {
      throw new Error("No command specified");
    }

    const commandId = this._commands.get(commandText.toLowerCase());

    if (!commandId) {
      throw new Error("No matching command found");
    }

    const astCommand = new AstCommandImpl(commandToken);
    const routeRef = this._commandContainer.get(commandId);
    const resolvedRouteRef = this.resolveSubCommand(
      routeRef,
      tokens,
      astCommand
    );

    const parsedArguments = await this.resolveArguments(
      resolvedRouteRef,
      tokens
    );

    return ast
      .applyPrefix(astPrefix)
      .applyCommand(astCommand)
      .applyArguments(parsedArguments);
  }

  public async resolveArguments(
    route: CommandRoute,
    tokens: Token[]
  ): Promise<ParsedAstArguments> {
    const { params } = route;
    const astArguments = new Map<string, AstArgument>();

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const {
        configuration,
        default: defaultValue,
        name,
        optional,
        type,
      } = param;

      const forAllTokensLeft = async <
        T extends (...args: any) => any,
        R extends ReturnType<T>
      >(
        cb: T,
        ...args: any[]
      ) => {
        const parsedValues: R[] = [];
        const text: string[] = [];

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const parsed = (await cb.apply(this, [token, ...args])) as R;
          parsedValues.push(parsed);
          text.push(token.text);
        }

        const fullText = text.join(" ");
        const position: TokenPosition = {
          text: fullText,
          tokenStart: tokens[0].position.tokenStart,
          tokenEnd: tokens[tokens.length - 1].position.tokenEnd,
        };

        return {
          position,
          fullText,
          parsedValues,
        };
      };

      const applyParseFn = async <
        T extends (...args: any) => any,
        R extends ReturnType<T>,
        A extends OmitFirstElement<ArgumentsOf<T>>
      >(
        cb: T,
        param: ParameterConfiguration,
        ...args: A
      ) => {
        const { hungry } = param;
        let parsed: R | R[];
        let text: string;
        let position: TokenPosition;

        if (hungry) {
          const hungryParsed = await forAllTokensLeft<T, R>(cb, ...args);

          position = hungryParsed.position;
          text = hungryParsed.fullText;
          parsed = hungryParsed.parsedValues;

          if (optional && isEmpty(parsed)) {
            return;
          }
        } else {
          const token = tokens.shift();

          if (isParameterToken(token)) {
          }

          parsed = (await cb.apply(this, [token, ...args])) as R;
          text = token.text;
          position = token.position;
        }

        const astArgument = new AstArgumentImpl(position, text, param, parsed);
        astArguments.set(name, astArgument);
      };

      if (this.matchParameterType(type, ADate)) {
        const { format, options } = configuration as DateParameterOptions;
        applyParseFn(this.parseToDate, param, format, options);
      }
    }

    return astArguments;
  }

  public parseToDate(
    dateString: string,
    format?: string,
    options?: DateTimeOptions
  ): DateTime {
    if (isNil(format)) {
      return DateTime.fromISO(dateString);
    }

    return DateTime.fromFormat(dateString, format, options);
  }

  public parseToUser() {}

  public parseToEmote() {}

  public parseToRole() {}

  public parseToChannel() {}

  public parseToMember() {}

  public parseToString() {}

  public matchParameterType<T>(type: any, resultType: T): type is T {
    return type === resultType;
  }

  /**
   * Resolves a command route using
   * the parsed command tokens to find
   * the deepest nested command.
   */
  public resolveSubCommand(
    route: CommandRoute,
    tokens: Token<CommandTokenKind>[],
    astCommand: AstCommand
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

      astCommand.applySubCommand(nextToken);
      routeRef = childRef;
    }

    return routeRef;
  }

  private readonly tokenizer: CommandTokenizer;
}
