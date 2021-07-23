import { IToken } from './token.interface';

export interface IParser<T> {
  parseInput(tokenList: IToken[]): T
}
