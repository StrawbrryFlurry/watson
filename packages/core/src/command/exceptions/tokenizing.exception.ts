import { RuntimeException } from '@watsonjs/common';

import { CommandTokenHost, CommandTokenList } from '../tokenizer';

export class TokenizingException extends RuntimeException {
  constructor(
    message: string,
    public parsed: CommandTokenList,
    public token?: CommandTokenHost
  ) {
    super(message);
  }
}
