import { Message } from 'discord.js';

import { ICommandParam } from '../../decorators';
import { CommandArgumentsHost } from './command-arguments.interface';

export interface CommandArgument<T = any> extends ICommandParam {
  isResolved: boolean;
  isNamed: boolean;
  namedParamContent: string;
  content: string | string[];
  message: Message;
  host: CommandArgumentsHost;
  value: T;
}
