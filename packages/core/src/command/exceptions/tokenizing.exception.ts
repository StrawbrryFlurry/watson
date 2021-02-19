import { RuntimeException } from '@watsonjs/common';

import { CommandToken, CommandTokenList } from '../tokenizer';

export class TokenizingException extends RuntimeException {
  constructor(
    message: string,
    public parsed: CommandTokenList,
    public token?: CommandToken
  ) {
    super(message);
  }
}
