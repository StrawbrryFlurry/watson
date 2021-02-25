import { BadArgumentException, CommandArgumentType, CommandTokenType, isNil } from '@watsonjs/common';

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

  public async parseArgument(argumentRef: CommandArgumentWrapper) {
    const { content, type, param } = argumentRef;
    const { type: paramType, default: d } = param;
    const { message } = this.argumentHost;

    let value: any;

    switch (paramType) {
      case CommandArgumentType.CHANNEL:
        value = this.discordParser.parseChannel(message, content, param);
        break;
      case CommandArgumentType.USER:
        value = this.discordParser.parseUser(message, content, param);
        break;
      case CommandArgumentType.ROLE:
        value = this.discordParser.parseRole(message, content, param);
        break;
      case CommandArgumentType.CUSTOM:
        value = await this.customParser.parseCustom(message, content, param);
        break;
      case CommandArgumentType.DATE:
        value = this.dateParser.parseDate(content, param);
        break;
      case CommandArgumentType.NUMBER:
        value = this.primitiveParser.parseNumber(content, param);
        break;
      case CommandArgumentType.STRING:
        value = this.primitiveParser.parseString(type, content, param);
        break;
      case CommandArgumentType.TEXT:
        value = this.primitiveParser.parseText(content);
        break;
      case CommandArgumentType.SWITCH:
        value = this.primitiveParser.parseBoolean(content);
        break;
    }

    if (isNil(value) && !isNil(d)) {
      value = d;
    }

    if (isNil(value)) {
      throw new BadArgumentException(param);
    }

    return argumentRef.resolveValue(value);
  }

  public async parseParameter(
    argumentRef: CommandArgumentWrapper,
    peek: CommandTokenHost
  ) {
    const { type } = argumentRef;

    if (type === CommandArgumentType.SWITCH) {
      return argumentRef.resolveValue(true);
    }

    if (isNil(peek)) {
      throw new BadArgumentException(argumentRef.param);
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
}
