import { Message } from 'discord.js';

import { ICommandParam } from '../../decorators';
import { CommandArguments } from './command-arguments.interface';

export interface CommandArgument<T = any> extends ICommandParam {
  isResolved: boolean;
  isNamed: boolean;
  namedParamContent: string;
  content: string | string[];
  message: Message;
  host: CommandArguments;
  value: T;
}
