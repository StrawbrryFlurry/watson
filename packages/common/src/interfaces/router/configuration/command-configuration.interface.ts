import { PermissionResolvable } from 'discord.js';

import { ICommandCooldown, ICommandOptions, ICommandParam } from '../../../decorators';
import { CommandPrefix } from '../../command';

export interface CommandConfiguration extends ICommandOptions {
  prefix: CommandPrefix;
  name: string;
  alias: string[];
  caseSensitive: boolean;
  params?: ICommandParam[];
  description: string;
  tags: string[];
  guild: boolean;
  dm: boolean;
  commandGroup: string;
  clientPermissions: PermissionResolvable[];
  cooldown?: ICommandCooldown;
  promt: boolean;
  maxPromts: number;
  promtTimeout: number;
  hidden: boolean;
}
