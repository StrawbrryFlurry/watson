import { CommandOptions, CommandParameterOptions } from '@decorators/common';
import { Prefix } from '@interfaces/command';
import { PermissionResolvable } from 'discord.js';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  description: string;

  prefix: Prefix;
  alias: string[];
  caseSensitive: boolean;
  params?: CommandParameterOptions[];
  tags: string[];
  guild: boolean;
  dm: boolean;
  commandGroup: string;
  clientPermissions: PermissionResolvable[];
  hidden: boolean;
}
