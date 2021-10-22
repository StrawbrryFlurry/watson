import { CommandOptions } from '@common/decorators';
import { Prefix } from '@common/interfaces';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  alias: string[];
  prefix: Prefix;

  description: string;
  fullDescription: string;
  usage: string;

  tags: string[];
  commandGroup: string;

  hidden: boolean;
  caseSensitive: boolean;

  deleteCommandMessage: boolean;
}
