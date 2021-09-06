import {
  AstArgumentImpl,
  CommandContainer,
  isGenericToken,
  isParameterToken,
  isPrefixToken,
  ParsingException,
  TokenPositionImpl,
} from '@command';
import {
  AstArgument,
  AstCommand,
  AstPrefix,
  ChannelMentionToken,
  CodeBlock,
  CommandAst,
  CommandParameterType,
  CommandPipeline,
  CommandRoute,
  CommandTokenKind,
  DiscordAdapter,
  EmoteToken,
  GenericToken,
  isNil,
  ParameterConfiguration,
  ParameterToken,
  Parsable,
  ParsedAstArguments,
  Parser,
  RoleMentionToken,
  StringLikeToken,
  StringLiteralToken,
  Token,
  TokenPosition,
  TokenWithValue,
  UserMentionToken,
} from '@watsonjs/common';
import { Client, Guild, Message, User } from 'discord.js';
import { DateTime, DateTimeOptions } from 'luxon';

import { WatsonContainer } from '../..';
import { ContextInjector } from '../../injector/context-injector';
import { AstCommandImpl, AstPrefixImpl, CommandAstImpl } from './ast';
import { CommandTokenizer } from './tokenizer';

const ACCEPTED_BOOLEAN_VALUES: string[] = [
  "true",
  "false",
  "yes",
  "no",
  "y",
  "n",
];

export type NextTokenFn = () => Token | null;
export type PeekTokenFn = () => Token | null;
export type UngetTokenFn = (token: Token) => void;

export class CommandParser implements Parser<CommandAst> {
  private _commands: Map<string, string>;
  private readonly tokenizer: CommandTokenizer;

  constructor(
    private _diContainer: WatsonContainer,
    private _commandContainer: CommandContainer
  ) {
    this._commands = this._commandContainer.commands;
  }

  public parseMessageTokens(message: Message, prefixLength: number) {
    const { content } = message;
    const tokenizer = new CommandTokenizer(this);
    return tokenizer.tokenize(content, prefixLength);
  }

  public async parseInput(tokenList: Token<any>[]): Promise<CommandAst> {
    throw new Error("Method not implemented.");
  }

  public async parseMessage(
    message: Message,
    prefixLength: number,
    pipeLine: CommandPipeline
  ): Promise<CommandAst> {
    const tokens = this.parseMessageTokens(message, prefixLength);

    /**
     * These methods allow us to change the
     * state of `tokens` in this lexical scope
     * throughout the parser and as well as `Parsables`.
     *
     * ??? WHY ???
     * Doing this we can use one parser instance
     * across the app and still allow users to
     * update references to a token or such through
     * a function.
     */
    const nextTokenFn = (): Token | null => tokens.shift() ?? null;
    const peekTokenFn = () => tokens[0];
    const ungetTokenFn = (token: Token): void => {
      tokens.unshift(token);
    };

    const prefixAst = this.getPrefixAst(nextTokenFn);
    const { commandAst, routeRef } = this.getCommandAst(
      nextTokenFn,
      peekTokenFn,
      ungetTokenFn
    );
    const parsedArguments = await this.getArgumentsAst(
      routeRef,
      nextTokenFn,
      peekTokenFn,
      ungetTokenFn
    );

    return new CommandAstImpl()
      .applyPrefix(prefixAst)
      .applyCommand(commandAst)
      .applyArguments(parsedArguments);
  }

  /** @Section Check Prefix */

  public getPrefixAst(nextTokenFn: NextTokenFn): AstPrefix {
    const prefixToken = nextTokenFn();

    if (!prefixToken) {
      throw new ParsingException("No prefix present");
    }

    if (!isPrefixToken(prefixToken)) {
      throw new ParsingException("No valid prefixToken found");
    }

    return new AstPrefixImpl(prefixToken);
  }

  /** @Section Resolve Command Used */

  public getCommandAst(
    nextTokenFn: NextTokenFn,
    peekTokenFn: PeekTokenFn,
    ungetTokenFn: UngetTokenFn
  ): {
    routeRef: CommandRoute;
    commandAst: AstCommand;
  } {
    const commandToken = nextTokenFn();

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
    const resolvedRouteRef = this.resolveSubCommand(
      routeRef,
      astCommand,
      nextTokenFn,
      peekTokenFn,
      ungetTokenFn
    );

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
    astCommand: AstCommand,
    nextTokenFn: NextTokenFn,
    peekTokenFn: PeekTokenFn,
    ungetTokenFn: UngetTokenFn
  ): CommandRoute {
    let routeRef = route;

    while (!isNil(routeRef.children)) {
      const { children } = routeRef;
      const nextToken = nextTokenFn();

      if (isNil(nextToken)) {
        break;
      }

      if (!isGenericToken(nextToken)) {
        ungetTokenFn(nextToken);
        break;
      }

      const { text } = nextToken;
      const childToken = children.get(text.toLowerCase());

      if (isNil(childToken)) {
        ungetTokenFn(nextToken);

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
    route: CommandRoute,
    nextTokenFn: NextTokenFn,
    peekTokenFn: PeekTokenFn,
    ungetTokenFn: UngetTokenFn
  ): Promise<ParsedAstArguments> {
    const { params } = route;
    const astArguments = new Map<string, AstArgument | null>();

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (this.shouldSkipParam(params, param)) {
        continue;
      }

      const { name } = param;
      const parameterValue = await this.processNextParameter(
        param,
        route,
        astArguments,
        [],
        [],
        nextTokenFn,
        peekTokenFn,
        ungetTokenFn
      );

      astArguments.set(name, parameterValue);
    }

    return astArguments;
  }

  /**
   * !help user @username @otherUser hey, you thingies
   *
   */

  public async processNextParameter<T extends any = any>(
    param: ParameterConfiguration,
    route: CommandRoute,
    accumulator: T[],
    parsedParams: ParameterConfiguration[],
    nextTokenFn: NextTokenFn,
    peekTokenFn: PeekTokenFn,
    ungetTokenFn: UngetTokenFn
  ): Promise<AstArgument> {
    const {
      default: defaultValue,
      configuration,
      hungry,
      name,
      paramType,
      optional,
    } = param;

    const nextToken = nextTokenFn();

    if (isNil(nextToken)) {
      if (optional) {
        return new AstArgumentImpl(
          new TokenPositionImpl("End Of Message", 0, 0),
          "null",
          param,
          null
        );
      }

      if (defaultValue) {
        return new AstArgumentImpl(
          new TokenPositionImpl("End Of Message", 0, 0),
          `${defaultValue}`,
          param,
          defaultValue
        );
      }

      throw new ParsingException(
        `Could not find not optional parameter with name ${name} in the command message`
      );
    }

    if (isParameterToken(nextToken)) {
      const { value } = nextToken;
      const argumentOrParameter = peekTokenFn();

      // Checking for switch parameter
      if (paramType === CommandParameterType.Boolean) {
        // Argument was used as switch
        if (
          isNil(argumentOrParameter) ||
          isParameterToken(argumentOrParameter)
        ) {
          parsedParams.push(param);
          return new AstArgumentImpl(nextToken.position, value, param, true);
        }

        if (this.isBooleanToken(argumentOrParameter)) {
          parsedParams.push(param);
          return this.parseToBoolean(
            argumentOrParameter as GenericToken,
            param
          );
        }

        const { kind, position } = argumentOrParameter;

        throw new ParsingException(
          `Unexpected token at position ${position}. Expected BOOLEAN got ${kind}`
        );
      }

      const valueToParse = this.getParameterInRouteFromToken(
        nextToken as ParameterToken,
        route
      );
    }

    return null as any;
  }

  public getParseFn<T>(
    param: ParameterConfiguration,
    type: CommandParameterType,
    injector: ContextInjector,
    nextTokenFn: NextTokenFn,
    peekTokenFn: PeekTokenFn,
    ungetTokenFn: UngetTokenFn
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
        const parsableRef = injector.create(param.type) as Parsable;
        parsableRef.parser = this;
        parsableRef.nextToken = nextTokenFn;
        parsableRef.peekToken = peekTokenFn;
        parsableRef.ungetToken = ungetTokenFn;
        // In this case we don't want
        // to bind the function to the
        // `this` context of the parser.
        return parsableRef.parse.bind(parsableRef);
    }

    return fn!.bind(this);
  }

  private shouldSkipParam(
    parsed: ParameterConfiguration[],
    param: ParameterConfiguration
  ): boolean {
    return parsed.includes(param);
  }

  private isBooleanToken(argument: Token): boolean {
    const value = (argument as TokenWithValue).value;

    if (isNil(value)) {
      return false;
    }

    const lowerCaseValue = value.toLowerCase();
    for (let i = 0; i < ACCEPTED_BOOLEAN_VALUES.length; i++) {
      const booleanValue = ACCEPTED_BOOLEAN_VALUES[i];

      if (lowerCaseValue === booleanValue) {
        return true;
      }
    }

    return false;
  }

  private getParameterInRouteFromToken(
    token: ParameterToken,
    route: CommandRoute
  ) {
    const { value } = token;
    const { params } = route;

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      const { name } = param;

      if (name === value) {
        return param;
      }
    }

    throw new ParsingException(
      `Could not find parameter with name ${value} at position ${token.position}`
    );
  }

  public parseToDate(
    token: StringLikeToken,
    format?: string,
    options?: DateTimeOptions
  ): DateTime {
    let dateString: string = "";

    if (isGenericToken(token)) {
      dateString = token.text;
    } else {
      dateString = (token as StringLiteralToken).value;
    }

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

  public parseToBoolean(
    token: StringLikeToken,
    param: ParameterConfiguration
  ): AstArgument {
    let value;

    if (isGenericToken(token)) {
      value = Boolean(token.text);
    } else {
      value = Boolean((token as StringLiteralToken).value);
    }

    return new AstArgumentImpl(token.position, token.text, param, value);
  }

  public parseToNumber() {}

  public parseToUrl() {}

  private expectNextTokenToBeOfKind(
    peekToken: PeekTokenFn,
    ...validKinds: CommandTokenKind[]
  ): CommandTokenKind {
    const { kind, position } = peekToken() ?? {};

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

  private getTokenPositionBounds(tokens: Token[]): Omit<TokenPosition, "text"> {
    const [{ position: firstPosition }] = tokens;
    const { position: lastPosition } = tokens[tokens.length - 1];

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
