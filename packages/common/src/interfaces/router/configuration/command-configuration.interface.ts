import { CommandOptions, CommandParameterOptions } from '@decorators';
import { Prefix } from '@interfaces';
import { PermissionResolvable } from 'discord.js';

export interface CommandConfiguration extends CommandOptions {
  name: string;
  description: string;

  prefix: Prefix;
  alias: string[];

  params?: CommandParameterOptions[];

  tags: string[];
  commandGroup: string;

  hidden: boolean;
  caseSensitive: boolean;
  guild: boolean;
  dm: boolean;

  // TODO: How to make this easy to use?
  clientPermissions: PermissionResolvable[];
}
