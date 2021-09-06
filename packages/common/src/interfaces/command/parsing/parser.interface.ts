import { CommandPipeline } from '@interfaces';
import { Message } from 'discord.js';

import { Token } from './token.interface';

export interface Parser<T = any> {
  parseInput(tokenList: Token[]): Promise<T>;
  parseMessage(
    message: Message,
    prefixLength: number,
    pipeline: CommandPipeline
  ): Promise<T>;
}
