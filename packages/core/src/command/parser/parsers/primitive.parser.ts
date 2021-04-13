import { BadArgumentException } from '@watsonjs/common';

import { CommandArgumentWrapper } from '../../command-argument-wrapper';
import { TokenizerKnownCharacters } from '../../tokenizer';

export class PrimitiveMessageTypeParser {
  public parseNumber(content: string, argument: CommandArgumentWrapper) {
    const number = Number(content);

    if (number === NaN) {
      throw new BadArgumentException(argument);
    }

    return number;
  }

  public parseString(content: string) {
    if (content.startsWith(TokenizerKnownCharacters.BEGIN_STRING_DOUBLE)) {
      content = content.replace(
        new RegExp(TokenizerKnownCharacters.BEGIN_STRING_DOUBLE, "g"),
        ""
      );
    } else {
      content = content.replace(
        new RegExp(TokenizerKnownCharacters.BEGIN_STRING_SINGLE, "g"),
        ""
      );
    }

    return content;
  }

  public parseText(content: string) {
    return content;
  }

  public parseBoolean(content: string) {
    return Boolean(content);
  }
}
