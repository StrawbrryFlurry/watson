import { Message } from 'discord.js';

import { TokenizerContext } from './tokenizer-context';

export class CommandTokenizer {
  public tokenize(message: Message) {
    const { content } = message;

    const context = new TokenizerContext(content);
    const tokens = context.tokenize();

    return tokens;
  }

  public tryTokenize(message: Message) {}
}
