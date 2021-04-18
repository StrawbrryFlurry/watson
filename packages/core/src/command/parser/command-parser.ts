import {
  BadArgumentException,
  ChannelArgument,
  CommandArgumentType,
  CommandTokenType,
  isNil,
  RoleArgument,
  UserArgument,
} from '@watsonjs/common';
import { Message } from 'discord.js';

import { CommandArgumentWrapper } from '../command-argument-wrapper';
import { CommandArgumentsHost } from '../pipe';
import { CommandTokenHost, TokenizerKnownCharacters } from '../tokenizer';
import {
  CustomMessageTypeParser,
  DateMessageTypeParser,
  DiscordMessageTypeParser,
  PrimitiveMessageTypeParser,
} from './parsers';

export class CommandParser {
  private argumentHost: CommandArgumentsHost;

  constructor(
    argumentHost: CommandArgumentsHost,
    private customParser = new CustomMessageTypeParser(),
    private discordParser = new DiscordMessageTypeParser(),
    private dateParser = new DateMessageTypeParser(),
    private primitiveParser = new PrimitiveMessageTypeParser()
  ) {
    this.argumentHost = argumentHost;
  }

  public async parseHungryArgument(argumentRef: CommandArgumentWrapper) {
    const { content } = argumentRef;
    const parsedArgs = [];

    for (const token of content as string[]) {
      const parsed = await this.parseArgumentToType(
        argumentRef,
        token,
        this.message
      );
      parsedArgs.push(parsed);
    }

    return argumentRef.resolveValue(parsedArgs);
  }

  public async parseArgument(argumentRef: CommandArgumentWrapper) {
    const { content } = argumentRef;

    /**
     * As hungry params will be handled with @method this.parseHungryArgument the
     * content will always be of type string.
     */
    let parsed = await this.parseArgumentToType(
      argumentRef,
      content as string,
      this.message
    );

    return argumentRef.resolveValue(parsed);
  }

  public async parseParameter(
    argumentRef: CommandArgumentWrapper,
    /**
     * The next token in the parsed token list
     * @example
     * `!ban -username @username`
     * Where `@username` would be the next token when
     * the `-username` parameter is parsed
     */
    peek: CommandTokenHost
  ) {
    const { type } = argumentRef;

    if (type === CommandArgumentType.SWITCH) {
      return argumentRef.resolveValue(true);
    }

    if (isNil(peek)) {
      throw new BadArgumentException(argumentRef);
    }

    argumentRef.content = peek.content;

    if (peek.type === CommandTokenType.ARGUMENT) {
      return this.parseArgument(argumentRef);
    }
  }

  /**
   * Removes the `-` marker of parameters
   */
  public normalizeParam(param: string) {
    return param.replace(TokenizerKnownCharacters.NAMED_PARAM_SINGLE, "");
  }

  private async parseArgumentToType<T = any>(
    argumentRef: CommandArgumentWrapper,
    content: string,
    message: Message
  ): Promise<T> {
    const { default: d, optional, type } = argumentRef;
    let parsed: any;
    // TODO:
    switch (type as any) {
      case ChannelArgument:
        parsed = this.discordParser.parseChannel(message, content, argumentRef);
        break;
      case UserArgument:
        parsed = this.discordParser.parseUser(message, content, argumentRef);
        break;
      case RoleArgument:
        parsed = this.discordParser.parseRole(message, content, argumentRef);
        break;
      case Object:
        parsed = await this.customParser.parseCustom(
          message,
          content,
          argumentRef
        );
        break;
      case CommandArgumentType.DATE:
        parsed = this.dateParser.parseDate(content, argumentRef);
        break;
      case CommandArgumentType.NUMBER:
        parsed = this.primitiveParser.parseNumber(content, argumentRef);
        break;
      case CommandArgumentType.STRING:
        parsed = this.primitiveParser.parseString(content);
        break;
      case CommandArgumentType.TEXT:
        parsed = this.primitiveParser.parseText(content);
        break;
      case CommandArgumentType.SWITCH:
        parsed = this.primitiveParser.parseBoolean(content);
        break;
    }

    if (isNil(parsed) && !isNil(d)) {
      parsed = d;
    }

    if (isNil(parsed) && !optional) {
      throw new BadArgumentException(argumentRef);
    }

    return parsed;
  }

  private get message() {
    return this.argumentHost.message;
  }
}
