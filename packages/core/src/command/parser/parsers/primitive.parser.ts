import { BadArgumentException, ICommandParam } from '@watsonjs/common';

import { TokenizerKnownCharacters } from '../../tokenizer';

export class PrimitiveMessageTypeParser {
  public parseNumber(content: string, param: ICommandParam) {
    const number = Number(content);

    if (number === NaN) {
      throw new BadArgumentException(param);
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
