import { PermissionResolvable } from 'discord.js';

import { ICommandCooldown, ICommandOptions, ICommandParameterMetadata } from '../../../decorators';
import { ICommandPrefix } from '../../command';

export interface CommandConfiguration extends ICommandOptions {
  prefix: ICommandPrefix;
  name: string;
  alias: string[];
  caseSensitive: boolean;
  params?: ICommandParameterMetadata[];
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
