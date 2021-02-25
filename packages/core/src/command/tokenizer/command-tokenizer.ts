import { TokenizerContext } from './tokenizer-context';

export class CommandTokenizer {
  public tokenize(content: string) {
    const context = new TokenizerContext(content);
    const tokens = context.tokenize();

    return tokens;
  }
}
