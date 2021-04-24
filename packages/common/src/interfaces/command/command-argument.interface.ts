import { Message } from 'discord.js';

import { ICommandParameterMetadata } from '../..';
import { CommandArgumentsHost } from './command-arguments.interface';

export interface CommandArgument<T = any> extends ICommandParameterMetadata {
  isResolved: boolean;
  isNamed: boolean;
  namedParamContent: string;
  content: string | string[];
  message: Message;
  host: CommandArgumentsHost;
  value: T;
}
