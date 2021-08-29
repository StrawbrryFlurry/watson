import { CommandOptions, CommandParameterOptions } from '@decorators';
import { Prefix } from '@interfaces';
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
