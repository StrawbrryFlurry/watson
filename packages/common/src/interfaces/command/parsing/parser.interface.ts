import { Message } from 'discord.js';

import { Token } from './token.interface';

export interface Parser<T = any> {
  parseInput(tokenList: Token[]): T;
  parseMessage(message: Message, prefixLength: number): T;
}
