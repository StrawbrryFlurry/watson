import { Prefix } from '@watsonjs/common';
import { PermissionResolvable } from 'discord.js';

import { CommandParameterHost } from './command-parameter';

/**
 * Holds command metadata for a given
 * command
 */
export class CommandDefinition {
  public name: string;
  public alias: string[];
  public description: string;
  public tags: string[];
  public prefix: Prefix;
  public caseSensitive: boolean;
  public parameters: CommandParameterHost[];
  public guild: boolean;
  public dm: boolean;
  public commandGroup: string;
  public clientPermissions: PermissionResolvable[];
  public cooldown: ;
  public hidden: boolean;
}
