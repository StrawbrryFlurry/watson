import { CommandPrefix, ICommandCooldown, Type } from '@watsonjs/common';
import { PermissionResolvable } from 'discord.js';

import { CommandParameterHost } from './command-parameter';

/**
 * Represents a command defined in a
 * receiver.
 */
export class CommandDefinition {
  public name: string;
  public alias: string[];
  public description: string;
  public tags: string[];
  public prefix: CommandPrefix;
  public caseSensitive: boolean;
  public parameters: CommandParameterHost[];
  public factoryDeps: Type[];
  public factory: () => any;
  public guild: boolean;
  public dm: boolean;
  public commandGroup: string;
  public clientPermissions: PermissionResolvable[];
  public cooldown?: ICommandCooldown;
  public promt: boolean;
  public maxPromts: number;
  public promtTimeout: number;
  public hidden: boolean;

  public addParameter(parameter: CommandParameterHost) {
    this.parameters.push(parameter);
  }
}
