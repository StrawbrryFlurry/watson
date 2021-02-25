import {
  BadArgumentException,
  CommandArgument,
  CommandArguments,
  CommandArgumentType,
  CommandPrefix,
  CommandTokenType,
  ICommandParam,
  isNil,
} from '@watsonjs/common';
import { Message } from 'discord.js';

import { CommandRouteHost } from '../../routes';
import { CommandArgumentWrapper } from '../command-argument-wrapper';
import { CommandParser } from '../parser';
import { CommandTokenHost, CommandTokenizer } from '../tokenizer';

export class CommandArgumentsHost implements CommandArguments {
  public message: Message;
  public arguments: CommandArgumentWrapper[] = [];
  public pendingArguments: CommandArgument[] = [];
  public params: ICommandParam[] = [];
  public route: CommandRouteHost;
  public tokens: CommandTokenHost[] = [];

  public base: string;
  public prefix: CommandPrefix;

  public commandBase: string;
  public aborted = false;

  private tokenIndex = 0;
  private tokenizer: CommandTokenizer;
  private parser: CommandParser;

  constructor(route: CommandRouteHost) {
    this.tokenizer = new CommandTokenizer();
    this.parser = new CommandParser(this);
    this.route = route;
    const {
      configuration: { params },
    } = route;
    this.params = params;
  }

  public async parseMessage(message: Message) {
    this.message = message;
    const tokens = this.tokenize(message);

    while (!(this.isResolved && this.aborted)) {
      const token = tokens[this.tokenIndex];
      const { type, content } = token;

      if (type === CommandTokenType.ARGUMENT) {
        const param = this.calculateAnonymousParam();
        const argumentRef = new CommandArgumentWrapper({
          ...param,
          content: content,
          isNamed: false,
          isResolved: false,
        });

        this.arguments.push(argumentRef);
        this.parser.parseArgument(argumentRef);
      }

      if (token.type === CommandTokenType.PARAMETER) {
        const paramName = this.parser.normalizeParam(content);
        const param = this.getParamByName(paramName);

        if (isNil(param)) {
          throw new BadArgumentException(param);
        }

        if (param.hungry === true) {
          const tokens = this.getTokenContentUntilNextParam();
          this.parser;
        }

        const argumentRef = new CommandArgumentWrapper({
          ...param,
          namedParamContent: content,
          isResolved: false,
          isNamed: true,
        });

        this.arguments.push(argumentRef);

        await this.parser.parseParameter(
          argumentRef,
          tokens[this.nextTokenIndex]
        );
      }
    }
  }

  private tokenize(message: Message) {
    const { content } = message;
    const tokenizerResult = this.tokenizer.tokenize(content);

    let base = tokenizerResult.getTokenByIndex(0).content;
    const tokens = tokenizerResult.tokens;
    this.tokens = tokens;
    // Remove the prefix from the token list
    tokens.shift();

    if (this.route.commandPrefix.isNamedPrefix) {
      base = base + tokenizerResult.getTokenByIndex(1).content;
      // Remove the command from the token list
      tokens.shift();
    }

    this.commandBase = base;
    return tokens;
  }

  /**
   * "Collects" the param from the user
   * by promting for it. If the timeout
   * or max promt count is reached the
   * execution will be aborted.
   */
  private collect(message: Message) {}

  /**
   * If named params were provided before an
   * unnamed one we cannot use the current token index
   * to determine the param from the param list as the named
   * param can be any index of the param list.
   *
   * This method will try to find the appropriate param
   * for the current token in the param list taking switch
   * params into account which only take one token space.
   *
   * Returns the param to use for this token
   */
  private calculateAnonymousParam() {
    const namedParams = this.arguments.filter((p) => p.isNamed === true);
    const switchCount = namedParams.filter(
      (p) => p.type === CommandArgumentType.SWITCH
    ).length;

    const expectedIndex =
      (namedParams.length - 1 - switchCount) * 2 + switchCount;
    const paramAtExpectedIndex = this.params[expectedIndex];
    const existing = this.getArgumentByParam(paramAtExpectedIndex.name);

    if (!isNil(existing)) {
      let index = expectedIndex + 1;

      while (true) {
        const nextParam = this.params[index];

        if (isNil(nextParam)) {
          throw new BadArgumentException(
            "Argument at index ${tokenIndex} was not found"
          );
        }

        const argument = this.getArgumentByParam(nextParam.name);

        if (isNil(argument) || !argument.isResolved) {
          return nextParam;
        }

        index++;
      }
    }

    return paramAtExpectedIndex;
  }

  /**
   * Returns the argument already processed
   * by the argument host by its parameter name
   */
  public getArgumentByParam(param: string) {
    return this.arguments.find((e) => e.name === param);
  }

  /**
   * Returns the parameter registered in
   * the `CommandRouteHost` by its name
   */
  public getParamByName(param: string) {
    return this.params.find((e) => e.name === param);
  }

  /**
   * Returns the params that were not yet
   * resolved
   */
  private getMissingParams() {
    return this.params.filter((e) => {
      const argumentRef = this.getArgumentByParam(e.name);

      if (isNil(argumentRef)) {
        return true;
      }

      if (argumentRef.isResolved === false) {
        return true;
      }

      return false;
    });
  }

  /**
   * Returns all tokens until the next parameter
   * Is used when a parameter is *hungry*
   */
  private getTokenContentUntilNextParam() {
    const tokens: CommandTokenHost[] = [];
    this.tokenIndex = this.nextTokenIndex;
    let token = this.currentToken;

    while (token.type !== CommandTokenType.PARAMETER && !isNil(token)) {
      tokens.push(token);
      this.tokenIndex = this.nextTokenIndex;
      token = this.currentToken;
    }

    return tokens.map((e) => e.content);
  }

  public get isResolved() {
    return this.getMissingParams().length === 0;
  }

  private get nextTokenIndex() {
    return this.tokenIndex + 1;
  }

  private get currentToken() {
    return this.tokens[this.tokenIndex];
  }
}
