import { ICommandParam } from '../decorators';
import { CommandException } from './command.exception';

/**
 * Sends a default message to the channel with information about the correct usage of the command.
 */
export class BadArgumentException extends CommandException {
  param: ICommandParam;

  constructor(param: ICommandParam) {
    super();

    this.param = param;
  }
}
