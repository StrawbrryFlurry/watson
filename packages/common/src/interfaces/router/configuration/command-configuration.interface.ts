import { CommandOptions, CommandParameterOptions } from '@decorators';
import { Prefix } from '@interfaces';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  alias: string[];
  prefix: Prefix;

  description: string;
  fullDescription: string;
  usage: string;

  params: CommandParameterOptions[];

  tags: string[];
  commandGroup: string;

  hidden: boolean;
  caseSensitive: boolean;
  guild: boolean;
  dm: boolean;

  deleteCommandMessage: boolean;
}
