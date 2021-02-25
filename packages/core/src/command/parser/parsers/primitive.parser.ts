import { BadArgumentException, ICommandParam } from '@watsonjs/common';

import { CommandTokenType, TokenizerKnownCharacters } from '../../tokenizer';

export class PrimitiveMessageTypeParser {
  public parseNumber(content: string, param: ICommandParam) {
    const number = Number(content);

    if (number === NaN) {
      throw new BadArgumentException(param);
    }

    return number;
  }

  public parseString(
    type: CommandTokenType,
    content: string,
    param: ICommandParam
  ) {
    if (!(type === CommandTokenType.STRING_ARGUMENT)) {
      throw new BadArgumentException(param);
    }

    if (content.startsWith(TokenizerKnownCharacters.BEGIN_STRING_DOUBLE)) {
      content = content.replace(
        TokenizerKnownCharacters.BEGIN_STRING_DOUBLE,
        ""
      );
    } else {
      content = content.replace(
        TokenizerKnownCharacters.BEGIN_STRING_SINGLE,
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
