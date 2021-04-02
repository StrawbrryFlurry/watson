import {
  BadArgumentException,
  CommandArguments,
  CommandArgumentType,
  CommandPrefix,
  CommandTokenType,
  ICommandParam,
  isEmpty,
  isNil,
  MaxPromtCountExceededException,
  MessageSendable,
  MissingArgumentException,
} from '@watsonjs/common';
import { Message } from 'discord.js';

import { CommandRouteHost } from '../../router';
import { CommandArgumentWrapper } from '../command-argument-wrapper';
import { CommandParser } from '../parser';
import { CommandTokenHost, CommandTokenizer } from '../tokenizer';

export class CommandArgumentsHost implements CommandArguments {
  public message: Message;
  public arguments: CommandArgumentWrapper[] = [];

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

  public getArgumentMap<T extends object = any>(): T {
    return this.arguments.reduce(
      (map, argument) => ({ ...map, [argument.name]: argument.value }),
      {}
    ) as T;
  }

  public async parseMessage(message: Message) {
    this.message = message;
    const tokens = this.tokenize(message);
    const { promt } = this.route.configuration;

    while (!(this.isResolved && this.aborted)) {
      const token = this.currentToken;

      if (isNil(token)) {
        const missingParams = this.getMissingParams(false);
        const missingOptionals = missingParams.filter(
          (e) => e.optional === true
        );

        this.handleOptionalParams(missingOptionals);

        if (this.isResolved) {
          return;
        }

        if (!promt) {
          throw new MissingArgumentException(missingParams);
        }

        await this.collect(missingParams);
      }

      const { type, content } = token;

      if (
        type === CommandTokenType.ARGUMENT ||
        type === CommandTokenType.STRING_ARGUMENT
      ) {
        const param = this.calculateAnonymousParam();

        if (param.hungry === true) {
          await this.handleHungryArgument(param, content);
          this.incrementTokenIndex();
          continue;
        }

        const argumentRef = new CommandArgumentWrapper({
          ...param,
          host: this,
          content: content,
        });

        this.arguments.push(argumentRef);
        await this.parser.parseArgument(argumentRef);
        this.incrementTokenIndex();
        continue;
      }

      if (type === CommandTokenType.PARAMETER) {
        const paramName = this.parser.normalizeParam(content);
        const param = this.getParamByName(paramName);

        if (isNil(param)) {
          throw new BadArgumentException(param);
        }

        if (param.hungry === true) {
          await this.handleHungryArgument(param, content, true);
          this.incrementTokenIndex();
          continue;
        }

        const argumentRef = new CommandArgumentWrapper({
          ...param,
          host: this,
          namedParamContent: content,
          isNamed: true,
        });

        this.arguments.push(argumentRef);

        await this.parser.parseParameter(
          argumentRef,
          tokens[this.nextTokenIndex]
        );
        this.incrementTokenIndex();
        continue;
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
  private async collect(unresolved: ICommandParam[]) {
    const { maxPromts } = this.configuration;

    for (const param of unresolved) {
      const { promt } = param;
      let resolved = false;
      let promts = 0;
      let message: MessageSendable;

      if (typeof promt === "function") {
        message = await promt(this.message);
      } else {
        message = promt;
      }

      while (!resolved && promts < maxPromts) {
        const response = await this.collectArgumentFromUser(message);

        const argumentRef = new CommandArgumentWrapper({
          ...param,
          content: response.content,
          message: response,
          host: this,
        });

        try {
          await this.parser.parseArgument(argumentRef);
          resolved = true;
        } catch {
          console.log("parsing failed");
        }
      }

      if (!resolved) {
        throw new MaxPromtCountExceededException(param.name);
      }
    }
  }

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
    const processedNamedParams =
      namedParams.length === 0 ? 0 : namedParams.length - 1;

    const switchCount = namedParams.filter(
      (p) => p.type === CommandArgumentType.SWITCH
    ).length;

    /**
     * Named params take two tokens to be processed
     * !remove channel -Channel #Channel
     */
    const expectedIndex = processedNamedParams * 2 - switchCount;
    const paramAtExpectedIndex = this.params[expectedIndex];
    const existing = this.getArgumentByParam(paramAtExpectedIndex.name);

    if (!isEmpty(existing)) {
      let index = expectedIndex + 1;

      while (true) {
        const nextParam = this.params[index];

        if (isNil(nextParam)) {
          throw new BadArgumentException(
            `Argument at index ${this.tokenIndex} was not found`
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
  private getMissingParams(incudeOptionals = true) {
    return this.params.filter((e) => {
      const argumentRef = this.getArgumentByParam(e.name);

      if (incudeOptionals && e.optional) {
        return false;
      }

      if (isNil(argumentRef)) {
        return true;
      }

      if (argumentRef.isResolved === false) {
        return true;
      }

      return false;
    });
  }

  private async handleHungryArgument(
    param: ICommandParam,
    content: string,
    isNamed = false
  ) {
    const tokens = this.getTokenContentUntilNextParam(isNamed);
    const argumentRef = new CommandArgumentWrapper({
      ...param,
      isResolved: false,
      isNamed: isNamed,
      content: tokens,
      namedParamContent: content,
    });
    this.arguments.push(argumentRef);
    await this.parser.parseHungryArgument(argumentRef);
  }

  /**
   * Returns all tokens until the next parameter
   * Is used when a parameter is *hungry*
   *
   * @param fromNamed True if this function was called
   * while parsing a named parameter in which case the
   * current token will be skipped.
   */
  private getTokenContentUntilNextParam(fromNamed: boolean) {
    const tokens: CommandTokenHost[] = [];
    this.tokenIndex = fromNamed ? this.nextTokenIndex : this.tokenIndex;
    let token = this.currentToken;

    while (!isNil(token) && token.type !== CommandTokenType.PARAMETER) {
      tokens.push(token);
      this.incrementTokenIndex();
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

  private get configuration() {
    return this.route.configuration;
  }

  /**
   * Sends the promt to the channel that the command originated
   * from.
   * @returns The Message received from the user or `undefined`
   * if the timeout exceeds
   */
  private async collectArgumentFromUser(promt: MessageSendable) {
    const { channel } = this.message;
    const { promtTimeout } = this.configuration;

    const messageFilter = (message: Message) =>
      message.author.id === this.message.author.id;

    await channel.send(promt);
    const response = await channel.awaitMessages(messageFilter, {
      max: 1,
      time: promtTimeout * 1000,
    });

    return response.first();
  }

  private handleOptionalParams(params: ICommandParam[]) {
    for (const param of params) {
      const { optional, default: d } = param;

      if (optional && !isNil(d)) {
        const argumentRef = new CommandArgumentWrapper({
          ...param,
          host: this,
          content: d,
          isResolved: true,
        });

        this.arguments.push(argumentRef);
      }
    }
  }

  private incrementTokenIndex() {
    this.tokenIndex++;
  }
}
