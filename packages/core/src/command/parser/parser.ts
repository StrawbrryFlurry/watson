import { AdapterRef } from '@core/adapters';
import {
  AstArgumentImpl,
  CommandAstImpl,
  CommandContainer,
  isGenericToken,
  isNumberToken,
  isParameterToken,
  isPrefixToken,
  NullToken,
  TokenImpl,
  TokenPositionImpl,
} from '@core/command';
import { ContextInjector } from '@core/di';
import {
  AstArgument,
  AstCommand,
  AstPrefix,
  BOOLEAN_LIKE_VALUES,
  ChannelMentionToken,
  CodeBlock,
  CodeBlockToken,
  CommandAst,
  CommandParameterType,
  CommandPipeline,
  CommandRoute,
  CommandTokenKind,
  DateParameterOptions,
  EmoteToken,
  GenericToken,
  GuildCtx,
  isFlagSet,
  isNil,
  NumberToken,
  ParameterConfiguration,
  ParameterToken,
  Parsable,
  ParsedAstArguments,
  Parser,
  RoleMentionToken,
  StringBuilder,
  StringExpandableToken,
  StringLikeToken,
  StringLiteralToken,
  StringTemplateToken,
  Token,
  TokenWithValue,
  UserMentionToken,
} from '@watsonjs/common';
import { Channel, Client, Emoji, Message, Role, User } from 'discord.js';
import { DateTime } from 'luxon';
import { format, URL } from 'url';

import { ParsingException } from '../exceptions/parsing.exception';
import { AstCommandImpl, AstPrefixImpl } from './ast';
import { CommandTokenizer } from './tokenizer';

type ParseFn<T> = (
  token: Token,
  param: ParameterConfiguration,
  ctx: ClosureCtx,
  configuration?: any,
  ...args: any[]
) => T | Promise<T>;

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

const STRING_LIKE_TOKEN_FLAGS =
  CommandTokenKind.Generic |
  CommandTokenKind.StringExpandable |
  CommandTokenKind.StringLiteral |
  CommandTokenKind.StringTemplate;

/**
 * A map of parameter types and the
 * token kinds they accept.
 */
const PARAMETER_TOKEN_MAP = {
  [CommandParameterType.String]: STRING_LIKE_TOKEN_FLAGS,
  [CommandParameterType.StringExpandable]: CommandTokenKind.StringExpandable,
  [CommandParameterType.StringLiteral]: CommandTokenKind.StringLiteral,
  [CommandParameterType.StringTemplate]: CommandTokenKind.StringTemplate,
  [CommandParameterType.Boolean]: STRING_LIKE_TOKEN_FLAGS,
  [CommandParameterType.Number]:
    STRING_LIKE_TOKEN_FLAGS | CommandTokenKind.Number,
  [CommandParameterType.URL]: STRING_LIKE_TOKEN_FLAGS,
  [CommandParameterType.Date]: STRING_LIKE_TOKEN_FLAGS,
  [CommandParameterType.Channel]:
    STRING_LIKE_TOKEN_FLAGS | CommandTokenKind.ChannelMention,
  [CommandParameterType.Role]:
    STRING_LIKE_TOKEN_FLAGS | CommandTokenKind.RoleMention,
  [CommandParameterType.User]:
    STRING_LIKE_TOKEN_FLAGS | CommandTokenKind.UserMention,
  [CommandParameterType.Emote]: CommandTokenKind.Emote,
  [CommandParameterType.CodeBlock]: CommandTokenKind.CodeBlock,
};

export type NextTokenFn = () => Token | null;
export type PeekTokenFn = () => Token | null;
export type UngetTokenFn = (token: Token) => void;

export class CommandParser implements Parser<CommandAst> {
  constructor(private _commandContainer: CommandContainer) {}

  public parseMessageTokens(message: Message, prefixLength: number) {
    const { content } = message;
    const tokenizer = new CommandTokenizer(this);
    return tokenizer.tokenize(content, prefixLength);
  }

  public async parseMessage(
    message: Message,
    prefixLength: number,
    pipeLine: CommandPipeline
  ): Promise<CommandAst> {
    const tokens = this.parseMessageTokens(message, prefixLength);
    return this.parseInput(tokens, pipeLine);
  }

  public async parseInput(
    tokens: Token<any>[],
    pipeLine: CommandPipeline
  ): Promise<CommandAst> {
    /**
     * These methods allow us to change the
     * state of `tokens` in this lexical scope
     * throughout the parser as well as in `Parsables`.
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
      throw new ParsingException(null, null, "No prefix present");
    }

    if (!isPrefixToken(prefixToken)) {
      throw new ParsingException(
        prefixToken,
        null,
        "No valid prefixToken found"
      );
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
      throw new ParsingException(commandToken, null, "No command found");
    }

    const { text: commandText, kind } = commandToken;

    if (kind !== CommandTokenKind.Generic) {
      throw new Error("No command specified");
    }

    const routeRef = this._commandContainer.get(commandText!.toLowerCase());

    if (isNil(routeRef)) {
      throw new Error("No matching command found");
    }

    const astCommand = new AstCommandImpl(commandToken);
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
      const childRef = children.get(text!.toLowerCase());

      if (isNil(childRef)) {
        ungetTokenFn(nextToken);
        break;
      }

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
    const { peekTokenFn } = ctx;

    const astArguments = new Map<string, AstArgument | null>();
    const parsedArguments: ParameterConfiguration[] = [];

    while (parsedArguments.length < params.length) {
      const argumentAst = await this.parseNextParameter(
        route,
        parsedArguments,
        ctx
      );
      const { name } = parsedArguments[parsedArguments.length - 1];
      astArguments.set(name, argumentAst);
    }

    // Clean up overflowing tokens
    if (!isNil(peekTokenFn())) {
      this.cleanUpTokenOverflow(astArguments, parsedArguments, ctx);
    }

    return astArguments;
  }

  /**
   * !help user @username @otherUser hey, you thingies
   *
   */

  public async parseNextParameter<T extends any = any>(
    route: CommandRoute,
    parsedParams: ParameterConfiguration[],
    ctx: ClosureCtx
  ): Promise<AstArgument<T>> {
    const { nextTokenFn } = ctx;
    const token = nextTokenFn();
    const param = this.getNextParameter(route, parsedParams)!;

    if (isNil(token)) {
      return this.parseEmptyNextToken<T>(param, parsedParams);
    }

    if (isParameterToken(token)) {
      return this.parseParameterToken<T>(route, token, parsedParams, ctx);
    }

    /**
     * At this point the next token will be a
     * regular text token in the command message:
     *
     * !help -All user
     *            ^
     */

    const { configuration, optional, default: defaultValue } = param;
    const parseFn = await this.getParseFn(param, ctx);
    let parsed: T;

    this.validateArgumentToken(token, param);

    try {
      parsed = (await parseFn(token, param, ctx, configuration)) as T;
    } catch (err: unknown) {
      if (optional) {
        return new AstArgumentImpl(
          new NullToken(),
          param,
          null
        ) as AstArgument<T>;
      }

      if (defaultValue) {
        const text = defaultValue?.toString() ?? null;
        return new AstArgumentImpl(new NullToken(text), param, text);
      }

      throw err;
    }

    return new AstArgumentImpl(token, param, parsed);
  }

  private async parseParameterToken<T extends any = any>(
    route: CommandRoute,
    paramToken: Token,
    parsedParams: ParameterConfiguration[],
    ctx: ClosureCtx
  ): Promise<AstArgument<T>> {
    const { peekTokenFn, nextTokenFn } = ctx;
    const argumentOrParameter = peekTokenFn();
    const param = this.getParameterInRouteFromToken(
      paramToken as ParameterToken,
      route
    );

    parsedParams.push(param);

    // Checking for switch parameter
    if (param.paramType === CommandParameterType.Boolean) {
      // Argument was used as switch
      if (isNil(argumentOrParameter) || isParameterToken(argumentOrParameter)) {
        parsedParams.push(param);
        return new AstArgumentImpl(paramToken, param, true) as AstArgument<T>;
      }

      if (this.isBooleanToken(argumentOrParameter)) {
        parsedParams.push(param);
        return this.parseToBoolean(
          argumentOrParameter as GenericToken,
          param
        ) as AstArgumentImpl<T>;
      }

      const { kind, position } = argumentOrParameter;

      throw new ParsingException(
        paramToken,
        param,
        `Unexpected token at position ${position}. Expected BOOLEAN got ${kind}`
      );
    }

    /** The parameter had no values */
    if (isNil(argumentOrParameter) || isParameterToken(argumentOrParameter)) {
      return this.parseEmptyNextToken(param, parsedParams);
    }

    const parseFn = await this.getParseFn<T>(param, ctx);
    const { hungry, configuration } = param;

    if (hungry) {
      return this.parseHungryArguments<T>(param, parseFn, ctx);
    }

    this.validateArgumentToken(argumentOrParameter, param);

    /** Pops `argumentOrParameter` off the tokens array */
    nextTokenFn();
    const parsed = await parseFn(
      argumentOrParameter,
      param,
      ctx,
      configuration
    );

    return new AstArgumentImpl(argumentOrParameter, param, parsed);
  }

  private async parseHungryArguments<T extends any = any>(
    param: ParameterConfiguration,
    parseFn: ParseFn<T>,
    ctx: ClosureCtx
  ): Promise<AstArgument<T>> {
    const { peekTokenFn, nextTokenFn, ungetTokenFn } = ctx;
    const { configuration, paramType } = param;
    const parsedArguments: any[] = [];
    const parsedTokens: Token[] = [];

    while (!isNil(peekTokenFn())) {
      const argumentOrParameter = nextTokenFn()!;

      // We've reached a new parameter
      if (isParameterToken(argumentOrParameter)) {
        ungetTokenFn(argumentOrParameter);
        const hungryToken = this.createHungryToken(parsedTokens);
        return new AstArgumentImpl(
          hungryToken,
          param,
          parsedArguments
        ) as AstArgumentImpl<T>;
      }

      this.validateArgumentToken(argumentOrParameter, param);

      const parsed = await parseFn(
        argumentOrParameter,
        param,
        ctx,
        configuration
      );

      parsedArguments.push(parsed);
      parsedTokens.push(argumentOrParameter);
    }

    const hungryToken = this.createHungryToken(parsedTokens);

    return new AstArgumentImpl(
      hungryToken,
      param,
      parsedArguments
    ) as AstArgumentImpl<T>;
  }

  private validateArgumentToken(
    token: Token,
    param: ParameterConfiguration
  ): void {
    const { name, paramType } = param;
    const { kind, position } = token;
    const validKinds = PARAMETER_TOKEN_MAP[paramType];

    if (!isFlagSet(kind, validKinds)) {
      throw new ParsingException(
        token,
        param,
        `Unexpected token "${token}" at position ${position} while parsing "${name}".`
      );
    }
  }

  private parseEmptyNextToken<T = any>(
    param: ParameterConfiguration,
    parsedParams: ParameterConfiguration[]
  ): AstArgument<T> {
    const { name, optional, default: defaultValue } = param;

    parsedParams.push(param);

    if (optional) {
      return new AstArgumentImpl(
        new NullToken(),
        param,
        null
      ) as AstArgument<T>;
    }

    if (defaultValue) {
      const defaultString: null | string = defaultValue?.toString() ?? null;

      return new AstArgumentImpl(
        new NullToken(defaultString),
        param,
        defaultValue
      );
    }

    throw new ParsingException(
      null,
      param,
      `Could not find required parameter with name ${name} in the command message`
    );
  }

  /**
   * If there are generic tokens at the end of
   * the token list which we didn't parse
   * before we add them to the last argument
   * parsed, given it was a generic token.
   */
  private cleanUpTokenOverflow(
    argumentAst: Map<string, AstArgument | null>,
    parsedArguments: ParameterConfiguration[],
    ctx: ClosureCtx
  ) {
    const { nextTokenFn, peekTokenFn } = ctx;
    let token = peekTokenFn()!;
    const { name, paramType } = parsedArguments[parsedArguments.length - 1];

    /**
     * We only append to `String` parameters
     * as all the other ones should be encapsulated
     * in `"`.
     */
    if (paramType !== CommandParameterType.String) {
      return;
    }

    const argumentToExpand = argumentAst.get(name)!;
    const { position } = argumentToExpand;
    const previousToken = new TokenImpl(CommandTokenKind.None, null, position);

    while (!isNil(peekTokenFn())) {
      token = nextTokenFn()!;
      /**
       * Right now we ignore non
       * generic tokens as we don't
       * have a way to concatenate
       * them with a previous token.
       */
      if (!isFlagSet(token.kind, STRING_LIKE_TOKEN_FLAGS)) {
        return;
      }

      const value = this.getValueFromStringLikeToken(token);
      argumentToExpand.value += ` ${value}`;
      argumentToExpand.text += token.text;
    }

    const { position: updatedPosition } = this.createHungryToken([
      previousToken,
      token,
    ]);

    argumentToExpand.position = updatedPosition;
  }

  /**
   * Returns the next parameter that
   * should be processed by the parser.
   */
  private getNextParameter(
    route: CommandRoute,
    parsedParams: ParameterConfiguration[]
  ): ParameterConfiguration | null {
    const { params } = route;

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      for (let y = 0; y < parsedParams.length; y++) {
        const parsed = parsedParams[y];
        if (parsed === param) {
          return param;
        }
      }
    }

    return null;
  }

  public async getParseFn<T>(
    param: ParameterConfiguration,
    ctx: ClosureCtx
  ): Promise<ParseFn<T>> {
    let fn: Function;
    const { paramType } = param;

    switch (paramType) {
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
        const parsableRef = await injector.get(param.type as typeof Parsable);
        parsableRef.parser = this;
        parsableRef.nextToken = nextTokenFn;
        parsableRef.peekToken = peekTokenFn;
        parsableRef.ungetToken = ungetTokenFn;
        // In this case we don't want
        // to bind the function to the
        // `this` context of the parser.
        return parsableRef.parse.bind(parsableRef) as ParseFn<T>;
    }

    return fn!.bind(this);
  }

  private isBooleanToken(argument: Token): boolean {
    const value = (argument as TokenWithValue).value;

    if (isNil(value)) {
      return false;
    }

    const lowerCaseValue = value.toLowerCase();
    for (let i = 0; i < BOOLEAN_LIKE_VALUES.length; i++) {
      const booleanValue = BOOLEAN_LIKE_VALUES[i];

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

      if (name.toLowerCase() === value.toLowerCase()) {
        return param;
      }
    }

    throw new ParsingException(
      token,
      null,
      `A parameter cannot be found that matches parameter name "${value}" at position ${token.position}`
    );
  }

  public parseToDate(
    token: StringLikeToken,
    param: ParameterConfiguration,
    ctx: ClosureCtx,
    options: DateParameterOptions
  ): AstArgument<DateTime> {
    const { format, options: formatOptions } = options;
    const argument = new AstArgumentImpl<DateTime>(token, param);
    const dateString = this.getValueFromStringLikeToken(token);

    if (isNil(format)) {
      return argument.withValue(DateTime.fromISO(dateString, formatOptions));
    }

    return argument.withValue(
      DateTime.fromFormat(dateString, format, formatOptions)
    );
  }

  public async parseToUser(
    token: StringLikeToken | UserMentionToken,
    param: ParameterConfiguration,
    ctx: ClosureCtx
  ): Promise<AstArgument<User>> {
    const { injector } = ctx;
    const { client } = await injector.get(AdapterRef);
    let userId: string;

    if (token.kind !== CommandTokenKind.UserMention) {
      userId = token.text!;
    } else {
      userId = (token as UserMentionToken).value;
    }

    const user = await (<Client>client).users.fetch(userId);
    return new AstArgumentImpl(token, param, user);
  }

  public async parseToRole(
    token: StringLikeToken | RoleMentionToken,
    param: ParameterConfiguration,
    ctx: ClosureCtx
  ): Promise<AstArgument<Role>> {
    const { injector } = ctx;
    const guild = await injector.get(GuildCtx);
    let roleId: string;

    if (token.kind !== CommandTokenKind.RoleMention) {
      roleId = token.text!;
    } else {
      roleId = (token as RoleMentionToken).value;
    }

    const role = await guild.roles.fetch(roleId);
    return new AstArgumentImpl(token, param, role!);
  }

  public async parseToChannel(
    token: StringLikeToken | ChannelMentionToken,
    param: ParameterConfiguration,
    ctx: ClosureCtx
  ): Promise<AstArgument<Channel>> {
    const { injector } = ctx;
    const guild = await injector.get(GuildCtx);
    let channelId: string;

    if (token.kind !== CommandTokenKind.ChannelMention) {
      channelId = token.text!;
    } else {
      channelId = (token as ChannelMentionToken).value;
    }

    const channel = guild.channels.resolve(channelId);
    return new AstArgumentImpl(token, param, channel!);
  }

  public async parseToEmote(
    token: StringLikeToken | EmoteToken,
    param: ParameterConfiguration,
    ctx: ClosureCtx
  ): Promise<AstArgument<Emoji>> {
    const { injector } = ctx;
    const { client } = await injector.get(AdapterRef);
    const argument = new AstArgumentImpl(token, param);
    let emojiId: string;

    if (token.kind !== CommandTokenKind.Emote) {
      emojiId = token.text!;
    } else {
      const idOrIsEmote = (token as EmoteToken).value;

      if (isNil(idOrIsEmote)) {
        return argument.withValue(token.text);
      }

      emojiId = idOrIsEmote;
    }

    const emoji = (<Client>client).emojis.resolve(emojiId);
    return argument.withValue(emoji!);
  }

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
      for (let i = 0; i < BOOLEAN_LIKE_VALUES.length; i++) {
        const { name, value } = BOOLEAN_LIKE_VALUES[i];

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
          token,
          param,
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
        token,
        param,
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
    const token = peekToken() ?? {};
    const { kind, position } = token as Token;

    for (let i = 0; i < validKinds.length; i++) {
      const kind = validKinds[i];
      if (kind === kind) {
        return kind;
      }
    }

    throw new ParsingException(
      token as Token,
      null,
      `Expected token at position ${position} to be one of ${validKinds.join(
        ", "
      )} but got ${kind}`
    );
  }

  /** @Section Utilities */

  private createHungryToken(tokens: Token[]): Token {
    const [{ position: firstPosition, kind }] = tokens;
    const { position: lastPosition } = tokens[tokens.length - 1];
    const { tokenStart } = firstPosition;
    const { tokenEnd } = lastPosition;

    const sb = new StringBuilder();

    for (let i = 0; i < tokens.length; i++) {
      const { text } = tokens[i];
      sb.append(text!);
      sb.append(" ");
    }

    const tokenText = sb.toString();
    const tokenPosition = new TokenPositionImpl(
      tokenText,
      tokenStart,
      tokenEnd
    );

    return new TokenImpl(kind, sb.toString(), tokenPosition);
  }
}
