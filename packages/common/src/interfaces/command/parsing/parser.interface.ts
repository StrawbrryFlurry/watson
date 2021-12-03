import { CommandPipeline } from '@common/interfaces/pipeline/command-pipeline.interface';
import { Message } from 'discord.js';

import { Token } from './token.interface';

export interface Parser<T = any> {
  parseInput(tokenList: Token[], pipeline: CommandPipeline): Promise<T>;
  parseMessage(
    message: Message,
    prefixLength: number,
    pipeline: CommandPipeline
  ): Promise<T>;
}
