import {
  AstArgumentImpl,
  CommandContainer,
  isGenericToken,
  isNumberToken,
  isParameterToken,
  isPrefixToken,
  ParsingException,
  TokenImpl,
  TokenPositionImpl,
} from '@command';
import {
  AstArgument,
  AstCommand,
  AstPrefix,
  CodeBlock,
  CodeBlockToken,
  CommandAst,
  CommandParameterType,
  CommandPipeline,
  CommandRoute,
  CommandTokenKind,
  GenericToken,
  isNil,
  NumberToken,
  ParameterConfiguration,
  ParameterToken,
  Parsable,
  ParsedAstArguments,
  Parser,
  StringExpandableToken,
  StringLikeToken,
  StringLiteralToken,
  StringTemplateToken,
  Token,
  TokenPosition,
  TokenWithValue,
} from '@watsonjs/common';
import { Message } from 'discord.js';
import { DateTime, DateTimeOptions } from 'luxon';
import { URL } from 'url';

import { WatsonContainer } from '../..';
import { ContextInjector } from '../../injector/context-injector';
import { AstCommandImpl, AstPrefixImpl, CommandAstImpl } from './ast';
import { CommandTokenizer } from './tokenizer';

export interface BooleanLikeValue {
  name: string;
  value: boolean;
}

const ACCEPTED_BOOLEAN_VALUES: BooleanLikeValue[] = [
  { name: "true", value: true },
  { name: "false", value: false },
  { name: "yes", value: true },
  { name: "no", value: false },
  { name: "y", value: true },
  { name: "n", value: false },
];

/**
 * Makes the passing of
 * closure reference arguments
 * a little easier
 */
interface ClosureCtx {
  nextTokenFn: NextTokenFn;
  peekTokenFn: PeekTokenFn;
  ungetTokenFn: UngetTokenFn;
  injector: ContextInjector;
}

const STRING_LIKE_TOKENS = [
  CommandTokenKind.Generic,
  CommandTokenKind.StringExpandable,
  CommandTokenKind.StringLiteral,
  CommandTokenKind.StringTemplate,
];

/**
 * A map of parameter types and the
 * token kinds they accept.
 */
const PARAMETER_TOKEN_TYPE_MAP = {
  [CommandParameterType.Boolean]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.Channel]: [
    ...STRING_LIKE_TOKENS,
    CommandTokenKind.ChannelMention,
  ],
  [CommandParameterType.CodeBlock]: [CommandTokenKind.CodeBlock],
  [CommandParameterType.Date]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.Emote]: [CommandTokenKind.Emote],
  [CommandParameterType.Number]: [
    ...STRING_LIKE_TOKENS,
    CommandTokenKind.Number,
  ],
  [CommandParameterType.Role]: [
    ...STRING_LIKE_TOKENS,
    CommandTokenKind.RoleMention,
  ],
  [CommandParameterType.User]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.String]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.StringExpandable]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.StringLiteral]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.StringTemplate]: [...STRING_LIKE_TOKENS],
  [CommandParameterType.URL]: [...STRING_LIKE_TOKENS],
};

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

    const closureCtx: ClosureCtx = {
      injector: pipeLine.getInjector(),
      nextTokenFn,
      peekTokenFn,
      ungetTokenFn,
    };

    const prefixAst = this.getPrefixAst(nextTokenFn);
    const { commandAst, routeRef } = this.getCommandAst(closureCtx);
    const parsedArguments = await this.getArgumentsAst(routeRef, closureCtx);

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

  public getCommandAst(ctx: ClosureCtx): {
    routeRef: CommandRoute;
    commandAst: AstCommand;
  } {
    const commandToken = ctx.nextTokenFn();

    if (isNil(commandToken)) {
      throw new ParsingException("No command found");
    }

    const { text: commandText, kind } = commandToken;

    if (kind !== CommandTokenKind.Generic) {
      throw new Error("No command specified");
    }

    const commandId = this._commands.get(commandText!.toLowerCase());

    if (isNil(commandId)) {
      throw new Error("No matching command found");
    }

    const astCommand = new AstCommandImpl(commandToken);
    // If we have an Id, we'll always get route
    const routeRef = this._commandContainer.get(commandId)!;
    const resolvedRouteRef = this.resolveSubCommand(routeRef, astCommand, ctx);

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
    ctx: ClosureCtx
  ): CommandRoute {
    const { nextTokenFn, ungetTokenFn } = ctx;
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
      const childToken = children.get(text!.toLowerCase());

      if (isNil(childToken)) {
        ungetTokenFn(nextToken);

        break;
      }

      const childRef = this._commandContainer.get(childToken)!;
      const { caseSensitive } = childRef.configuration;

      if (caseSensitive) {
        const hasName = childRef.hasName(text!, true);

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
    ctx: ClosureCtx
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
        [],
        [],
        ctx
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
    ctx: ClosureCtx
  ): Promise<AstArgument> {
    const {
      default: defaultValue,
      configuration,
      hungry,
      name,
      paramType,
      optional,
    } = param;
    const { nextTokenFn, peekTokenFn } = ctx;
    const nextToken = nextTokenFn();

    if (isNil(nextToken)) {
      if (optional) {
        return new AstArgumentImpl(
          new TokenImpl(null, null, new TokenPositionImpl(null, null, null)),
          param,
          null
        );
      }

      if (defaultValue) {
        const defaultString: null | string =
          defaultValue ?? defaultValue.toString();
        return new AstArgumentImpl(
          new TokenImpl(
            null,
            defaultString,
            new TokenPositionImpl(defaultString, null, null)
          ),
          param,
          defaultValue
        );
      }

      throw new ParsingException(
        `Could not find not optional parameter with name ${name} in the command message`
      );
    }

    if (isParameterToken(nextToken)) {
      const argumentOrParameter = peekTokenFn();

      // Checking for switch parameter
      if (paramType === CommandParameterType.Boolean) {
        // Argument was used as switch
        if (
          isNil(argumentOrParameter) ||
          isParameterToken(argumentOrParameter)
        ) {
          parsedParams.push(param);
          return new AstArgumentImpl(nextToken, param, true);
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
    ctx: ClosureCtx
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
        const { injector, nextTokenFn, peekTokenFn, ungetTokenFn } = ctx;
        const parsableRef = injector.create<Parsable>(param.type as Parsable);
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
    param: ParameterConfiguration,
    format?: string,
    options?: DateTimeOptions
  ): AstArgument<DateTime> {
    const argument = new AstArgumentImpl<DateTime>(token, param);
    const dateString = this.getValueFromStringLikeToken(token);

    if (isNil(format)) {
      return argument.withValue(DateTime.fromISO(dateString));
    }

    return argument.withValue(DateTime.fromFormat(dateString, format, options));
  }

  /*
  TODO: Clean up discord parsing
  public parseToUser(
    token: StringLikeToken | UserMentionToken
  ): Promise<AstArgument<User>> {
    if (token.kind !== CommandTokenKind.UserMention) {
      // TODO: Improve this
      const userId = token.text!;
      return this.getClient().users.fetch(userId);
    }

    return (token as UserMentionToken).getUser(this.getAdapter());
  }

  public parseToRole(
    guild: Guild,
    token: StringLikeToken | RoleMentionToken
  ): Promise<AstArgument<Role>> {
    if (token.kind !== CommandTokenKind.RoleMention) {
      const roleId = token.text!;
      return guild.roles.fetch(roleId);
    }

    return (token as RoleMentionToken).getRole(guild);
  }

  public parseToChannel(
    token: StringLikeToken | ChannelMentionToken
  ): Promise<AstArgument<Channel>> {
    if (token.kind !== CommandTokenKind.ChannelMention) {
      const channelId = token.text!;
      return this.getClient().channels.fetch(channelId);
    }

    return (token as ChannelMentionToken).getChannel(this.getAdapter());
  }

  public parseToEmote(
    token: StringLikeToken | EmoteToken
  ): Promise<AstArgument<Emoji>> {
    if (token.kind !== CommandTokenKind.Emote) {
      const emoteId = token.text!;
      return this.getClient().emojis.resolve(emoteId);
    }

    return (token as EmoteToken).getEmote(this.getAdapter());
  }

  */

  public parseToString(
    token: StringLikeToken,
    param: ParameterConfiguration
  ): AstArgument<string> {
    const value = this.getValueFromStringLikeToken(token);
    return new AstArgumentImpl<string>(token, param, value);
  }

  public parseToCodeBlock(
    token: CodeBlockToken,
    param: ParameterConfiguration
  ): AstArgument<CodeBlock> {
    const argument = new AstArgumentImpl<CodeBlock>(token, param);
    const { language, text, value } = token;
    const codeBlock: CodeBlock = {
      code: value,
      language: language,
      raw: text!,
    };

    return argument.withValue(codeBlock);
  }

  // In the future we might allow
  // for variables in strings
  // or other templating features
  public parseToStringExpandable(
    token: StringExpandableToken,
    param: ParameterConfiguration
  ): AstArgument<string> {
    const argument = new AstArgumentImpl<string>(token, param);
    return argument.withValue(token.value);
  }

  public parseToStringLiteral(
    token: StringLiteralToken,
    param: ParameterConfiguration
  ): AstArgument<string> {
    const argument = new AstArgumentImpl<string>(token, param);
    return argument.withValue(token.value);
  }

  public parseToStringTemplate(
    token: StringTemplateToken,
    param: ParameterConfiguration
  ): AstArgument<string> {
    const argument = new AstArgumentImpl<string>(token, param);
    return argument.withValue(token.value);
  }

  public parseToBoolean(
    token: StringLikeToken,
    param: ParameterConfiguration
  ): AstArgument<boolean> {
    const boolean = this.getValueFromStringLikeToken(token);
    const inferBooleanLikeValue = () => {
      const lowerCaseValue = boolean.toLowerCase();
      for (let i = 0; i < ACCEPTED_BOOLEAN_VALUES.length; i++) {
        const { name, value } = ACCEPTED_BOOLEAN_VALUES[i];

        if (lowerCaseValue === name) {
          return value;
        }
      }

      return null;
    };

    const booleanLikeValue = inferBooleanLikeValue();
    const argument = new AstArgumentImpl<boolean>(token, param);

    if (!isNil(booleanLikeValue)) {
      return argument.withValue(booleanLikeValue);
    }

    return argument.withValue(Boolean(boolean));
  }

  public parseToNumber(
    token: StringLikeToken | NumberToken,
    param: ParameterConfiguration
  ): AstArgument<number> {
    const argument = new AstArgumentImpl<number>(token, param);
    const { text, position } = token;

    const checkNaN = (number: number) => {
      if (isNaN(number)) {
        throw new ParsingException(
          `Unexpected token "${text}" at position ${position}. Expected Number got NaN.`
        );
      }
    };

    if (isNumberToken(token)) {
      const number = token.value;
      checkNaN(number);
      return argument.withValue(number);
    }

    const value = this.getValueFromStringLikeToken(token);
    const number = Number(value);
    checkNaN(number);
    return argument.withValue(number);
  }

  public parseToUrl(
    token: StringLikeToken,
    param: ParameterConfiguration
  ): AstArgument<URL> {
    const url = this.getValueFromStringLikeToken(token);
    let parsed: URL;

    try {
      parsed = new URL(url);
    } catch (err) {
      throw new ParsingException(
        `Failed to parse token "${url}" of kind "${token.kind}" type URL`
      );
    }

    return new AstArgumentImpl<URL>(token, param, parsed);
  }

  private getValueFromStringLikeToken(token: StringLikeToken): string {
    return isGenericToken(token)
      ? (token.text as string)
      : ((token as StringLiteralToken).value as string);
  }

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
}
