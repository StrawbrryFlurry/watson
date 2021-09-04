import {
  AstArgumentImpl,
  CommandContainer,
  isGenericToken,
  isParameterToken,
  isPrefixToken,
  ParsingException,
} from '@command';
import {
  ADate,
  ArgumentsOf,
  AstArgument,
  AstCommand,
  AstPrefix,
  ChannelMentionToken,
  CodeBlock,
  CommandAst,
  CommandParameterType,
  CommandRoute,
  CommandTokenKind,
  DateParameterOptions,
  DiscordAdapter,
  EmoteToken,
  isEmpty,
  isNil,
  OmitFirstElement,
  ParameterConfiguration,
  Parsable,
  ParsedAstArguments,
  Parser,
  RoleMentionToken,
  StringLikeToken,
  Token,
  TokenPosition,
  UserMentionToken,
} from '@watsonjs/common';
import { Client, Guild, Message, User } from 'discord.js';
import { DateTime, DateTimeOptions } from 'luxon';

import { WatsonContainer } from '../..';
import { AstCommandImpl, AstPrefixImpl, CommandAstImpl } from './ast';
import { CommandTokenizer } from './tokenizer';

export class CommandParser implements Parser<CommandAst> {
  private _commands: Map<string, string>;
  private readonly tokenizer: CommandTokenizer;

  // TODO: Add context injector to the command pipe
  private readonly contextInjector: any;

  public get isDisposed(): boolean {
    return this._disposed;
  }

  public set isDisposed(status: boolean) {
    if (this._disposed === true) {
      return;
    }

    this._disposed = status;
  }
  private _disposed: boolean = false;
  private _tokens: Token[];

  constructor(
    private _diContainer: WatsonContainer,
    private _commandContainer: CommandContainer
  ) {
    this._commands = this._commandContainer.commands;
  }

  public parseMessageTokens(message: Message, prefixLength: number) {
    const { content } = message;
    const tokenizer = new CommandTokenizer(this);
    this._tokens = tokenizer.tokenize(content, prefixLength);
  }

  public async parseInput(tokenList: Token<any>[]): Promise<CommandAst> {
    throw new Error("Method not implemented.");
  }

  public async parseMessage(
    message: Message,
    prefixLength: number
  ): Promise<CommandAst> {
    if (this.isDisposed) {
      throw new Error(
        "Parser is already disposed - Create a new parser instance"
      );
    }

    this.parseMessageTokens(message, prefixLength);

    const prefixAst = this.getPrefixAst();
    const { commandAst, routeRef } = this.getCommandAst();
    const parsedArguments = await this.getArgumentsAst(routeRef);

    return new CommandAstImpl()
      .applyPrefix(prefixAst)
      .applyCommand(commandAst)
      .applyArguments(parsedArguments);
  }

  /** @Section Check Prefix */

  public getPrefixAst(): AstPrefix {
    const prefixToken = this.getNextToken();

    if (!prefixToken) {
      throw new ParsingException("No prefix present");
    }

    if (!isPrefixToken(prefixToken)) {
      throw new ParsingException("No valid prefixToken found");
    }

    return new AstPrefixImpl(prefixToken);
  }

  /** @Section Resolve Command Used */

  public getCommandAst(): {
    routeRef: CommandRoute;
    commandAst: AstCommand;
  } {
    const commandToken = this.getNextToken();

    if (isNil(commandToken)) {
      throw new ParsingException("No command found");
    }

    const { text: commandText, kind } = commandToken;

    if (kind !== CommandTokenKind.Generic) {
      throw new Error("No command specified");
    }

    const commandId = this._commands.get(commandText.toLowerCase());

    if (isNil(commandId)) {
      throw new Error("No matching command found");
    }

    const astCommand = new AstCommandImpl(commandToken);
    // If we have an Id, we'll always get route
    const routeRef = this._commandContainer.get(commandId)!;
    const resolvedRouteRef = this.resolveSubCommand(routeRef, astCommand);

    return {
      routeRef: resolvedRouteRef,
      commandAst: astCommand,
    };
  }

  /**
   * Resolves a command route using
   * the parsed command tokens to find
   * the deepest nested command.
   */
  public resolveSubCommand(
    route: CommandRoute,
    astCommand: AstCommand
  ): CommandRoute {
    let routeRef = route;

    while (!isNil(routeRef.children)) {
      const { children } = routeRef;
      const nextToken = this.getNextToken();

      if (isNil(nextToken)) {
        break;
      }

      if (!isGenericToken(nextToken)) {
        this.ungetToken(nextToken);
        break;
      }

      const { text } = nextToken;
      const childToken = children.get(text.toLowerCase());

      if (isNil(childToken)) {
        this.ungetToken(nextToken);

        break;
      }

      const childRef = this._commandContainer.get(childToken)!;
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

  /** @Section Parse Arguments */

  public async getArgumentsAst(
    route: CommandRoute
  ): Promise<ParsedAstArguments> {
    const { params } = route;
    const astArguments = new Map<string, AstArgument>();

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const { name } = param;
      const parameterValue = await this.processNextParameter(param);
      astArguments.set(name, parameterValue);
    }

    return astArguments;
  }

  /**
   * !help user @username @otherUser hey, you thingies
   *
   */

  public async processNextParameter<T = any>(
    param: ParameterConfiguration,
    accumulator: T[] = []
  ): Promise<T | null> {
    const {
      default: defaultValue,
      configuration,
      hungry,
      name,
      paramType,
      optional,
    } = param;

    const nextToken = this.getNextToken();

    if (isNil(nextToken)) {
      if (optional) {
        return null;
      }

      if (defaultValue) {
        return defaultValue;
      }

      throw new ParsingException(
        `Could not find not optional parameter with name ${name} in the command message`
      );
    }

    if (isParameterToken(nextToken)) {
      if (paramType === CommandParameterType.Boolean) {
        return true as unknown as T;
      }
    }

    return null;
  }

  public getParseFn<T>(
    param: ParameterConfiguration,
    type: CommandParameterType
  ): (...args: any[]) => T {
    let fn: Function;

    switch (type) {
      case CommandParameterType.Boolean:
        fn = this.parseToBoolean;
        break;
      case CommandParameterType.Number:
        fn = this.parseToNumber;
        break;
      case CommandParameterType.String:
        fn = this.parseToString;
        break;
      case CommandParameterType.StringExpandable:
        fn = this.parseToStringExpandable;
        break;
      case CommandParameterType.StringLiteral:
        fn = this.parseToStringLiteral;
        break;
      case CommandParameterType.StringTemplate:
        fn = this.parseToStringTemplate;
        break;
      case CommandParameterType.URL:
        fn = this.parseToUrl;
        break;
      case CommandParameterType.Date:
        fn = this.parseToDate;
        break;
      case CommandParameterType.Channel:
        fn = this.parseToChannel;
        break;
      case CommandParameterType.Role:
        fn = this.parseToRole;
        break;
      case CommandParameterType.User:
        fn = this.parseToUser;
        break;
      case CommandParameterType.Emote:
        fn = this.parseToEmote;
        break;
      case CommandParameterType.CodeBlock:
        fn = this.parseToCodeBlock;
        break;
      case CommandParameterType.Custom:
        const parsableRef = this.contextInjector.create(param.type) as Parsable;
        parsableRef.parser = this;
        parsableRef.getNextToken = this.getNextToken.bind(this);
        fn = parsableRef.parse.bind(parsableRef);
        break;
    }

    return fn!.bind(this);
  }

  public async _getArgumentsAst(
    route: CommandRoute
  ): Promise<ParsedAstArguments> {
    const { params } = route;
    const astArguments = new Map<string, AstArgument>();

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const {} = param;

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
          const token = this.getNextToken();

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

  public parseToUser(token: StringLikeToken | UserMentionToken): Promise<User> {
    if (token.kind !== CommandTokenKind.UserMention) {
      // TODO: Improve this
      const userId = token.text;
      return this.getClient().users.fetch(userId);
    }

    return (token as UserMentionToken).getUser(this.getAdapter());
  }

  public parseToRole(guild: Guild, token: StringLikeToken | RoleMentionToken) {
    if (token.kind !== CommandTokenKind.RoleMention) {
      const roleId = token.text;
      return guild.roles.fetch(roleId);
    }

    return (token as RoleMentionToken).getRole(guild);
  }

  public parseToChannel(token: StringLikeToken | ChannelMentionToken) {
    if (token.kind !== CommandTokenKind.ChannelMention) {
      const channelId = token.text;
      return this.getClient().channels.fetch(channelId);
    }

    return (token as ChannelMentionToken).getChannel(this.getAdapter());
  }

  public parseToEmote(token: StringLikeToken | EmoteToken) {
    if (token.kind !== CommandTokenKind.Emote) {
      const emoteId = token.text;
      return this.getClient().emojis.resolve(emoteId);
    }

    return (token as EmoteToken).getEmote(this.getAdapter());
  }

  public parseToString(token: StringLikeToken): string {
    return "";
  }

  public parseToCodeBlock(): CodeBlock {
    return "" as any;
  }

  public parseToStringExpandable() {}
  public parseToStringLiteral() {}
  public parseToStringTemplate() {}

  public parseToBoolean() {}

  public parseToNumber() {}

  public parseToUrl() {}

  private expectNextTokenToBeOfKind(
    ...validKinds: CommandTokenKind[]
  ): CommandTokenKind {
    const { kind, position } = this.peekNextToken();

    for (let i = 0; i < validKinds.length; i++) {
      const kind = validKinds[i];
      if (kind === kind) {
        return kind;
      }
    }

    throw new ParsingException(
      `Expected token at position ${position} to be one of ${validKinds.join(
        ", "
      )} but got ${kind}`
    );
  }

  /** @Section Utilities */

  public getNextToken(): Token<CommandTokenKind> | null {
    return this._tokens.shift() ?? null;
  }

  public peekNextToken(): Token<CommandTokenKind> {
    return this._tokens[0];
  }

  public ungetToken(token: Token): void {
    this._tokens.unshift(token);
  }

  private getTokenPositionBounds(): Omit<TokenPosition, "text"> {
    const [{ position: firstPosition }] = this._tokens;
    const { position: lastPosition } = this._tokens[this._tokens.length - 1];

    return {
      tokenStart: firstPosition.tokenStart,
      tokenEnd: lastPosition.tokenEnd,
    };
  }

  private getAdapter(): DiscordAdapter {
    return this._diContainer.getClientAdapter();
  }

  private getClient(): Client {
    return this._diContainer.getClient<Client>();
  }
}
