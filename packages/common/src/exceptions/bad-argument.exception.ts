import { CommandArgument } from '@common/command/command-argument.interface';
import { isString } from '@common/utils';
import { MessageEmbed } from 'discord.js';

import { RuntimeException } from './runtime-exception';

/**
 * Sends a default message to the channel with information about the correct usage of the command.
 */
export class BadArgumentException extends RuntimeException {
  public readonly argument: CommandArgument;

  constructor(message: string | MessageEmbed);
  constructor(argument: CommandArgument);
  constructor(argument: CommandArgument | string | MessageEmbed) {
    if (BadArgumentException.isCustomMessage(argument)) {
      super(argument as string);
    } else {
      super(argument);
      this.argument = argument as CommandArgument;
    }
  }

  private static isCustomMessage(
    param: CommandArgument | string | MessageEmbed
  ) {
    return isString(param) || param instanceof MessageEmbed;
  }
}
