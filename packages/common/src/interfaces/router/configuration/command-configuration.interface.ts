import { CommandOptions } from '@decorators';
import { Prefix } from '@interfaces';

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
