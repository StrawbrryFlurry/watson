import { Message } from 'discord.js';

import { IToken } from './token.interface';

export interface IParser<T = any> {
  parseInput(tokenList: IToken[]): T;
  parseMessage(message: Message, prefixLength: number): T;
}
