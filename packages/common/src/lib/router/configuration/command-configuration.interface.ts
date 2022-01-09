import { CommandOptions } from '@common/decorators/common/command.decorator';

import { ParameterConfiguration } from './parameter-configuration.interface';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  alias: string[];
  params: ParameterConfiguration[];

  description: string;
  fullDescription: string;
  usage: string | string[] | null;

  tags: string[];
  commandGroup: string;

  hidden: boolean;
  caseSensitive: boolean;

  deleteCommandMessage: boolean;
}
