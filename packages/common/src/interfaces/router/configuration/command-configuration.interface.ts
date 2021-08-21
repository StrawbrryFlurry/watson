import { CommandOptions, CommandParameterOptions } from '@decorators/common';
import { Prefix } from '@interfaces/command';
import { PermissionResolvable } from 'discord.js';

export interface CommandConfiguration extends CommandOptions {
  prefix: Prefix;
  name: string;
  alias: string[];
  caseSensitive: boolean;
  params?: CommandParameterOptions[];
  description: string;
  tags: string[];
  guild: boolean;
  dm: boolean;
  commandGroup: string;
  clientPermissions: PermissionResolvable[];
  hidden: boolean;
}
