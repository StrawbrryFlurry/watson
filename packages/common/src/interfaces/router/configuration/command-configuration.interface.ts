import { CommandOptions } from '@common/decorators';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  alias: string[];

  description: string;
  fullDescription: string;
  usage: string | string[] | null;

  tags: string[];
  commandGroup: string;

  hidden: boolean;
  caseSensitive: boolean;

  deleteCommandMessage: boolean;
}
