import { MessageEmbed } from 'discord.js';

import { ICommandParam } from '../decorators';
import { isString } from '../utils';
import { EventException } from './event.exception';

/**
 * Sends a default message to the channel with information about the correct usage of the command.
 */
export class BadArgumentException extends EventException {
  param: ICommandParam;

  constructor(message: string | MessageEmbed);
  constructor(param: ICommandParam);
  constructor(param: ICommandParam | string | MessageEmbed) {
    if (BadArgumentException.isCustomMessage(param)) {
      super(param as string);
    } else {
      super();
      this.param = param as ICommandParam;
    }
  }

  private static isCustomMessage(param: ICommandParam | string | MessageEmbed) {
    return isString(param) || param instanceof MessageEmbed;
  }
}
