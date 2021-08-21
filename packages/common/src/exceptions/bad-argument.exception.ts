import { RuntimeException } from '@exceptions';
import { MessageEmbed } from 'discord.js';

import { CommandArgument } from '../interfaces';
import { isString } from '../utils';

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
